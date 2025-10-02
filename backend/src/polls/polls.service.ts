import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Poll } from './schemas/poll.schema';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { VoteDto } from './dto/vote.dto';
import { PollsGateway } from './polls.gateway';
import { User } from '../users/schemas/user.schema';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class PollsService {
  constructor(
    @InjectModel(Poll.name) private pollModel: Model<Poll>,
    @InjectModel(User.name) private userModel: Model<User>,
    private pollsGateway: PollsGateway,
  ) {}

  async create(createPollDto: CreatePollDto, userId: string): Promise<Poll> {
    const trimmedOptions = createPollDto.options.map(opt => opt.trim()).filter(opt => opt.length > 0);

    if (trimmedOptions.length < 2) {
      throw new BadRequestException('Poll must have at least 2 non-empty options');
    }

    const uniqueOptions = [...new Set(trimmedOptions)];
    if (uniqueOptions.length !== trimmedOptions.length) {
      throw new BadRequestException('Poll options must be unique');
    }

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + createPollDto.durationMinutes);

    const options = uniqueOptions.map((text) => ({
      text,
      votes: 0,
      votedBy: [],
    }));

    const poll = new this.pollModel({
      ...createPollDto,
      options,
      createdBy: new Types.ObjectId(userId),
      expiresAt,
      allowedUsers: createPollDto.allowedUsers?.map((id) => new Types.ObjectId(id)) || [],
    });

    const savedPoll = await poll.save();
    this.pollsGateway.emitPollCreated(savedPoll);
    return savedPoll;
  }

  async findAll(userId: string): Promise<Poll[]> {
    const userObjectId = new Types.ObjectId(userId);

    return this.pollModel
      .find({
        $or: [
          { isPublic: true },
          { allowedUsers: userObjectId },
          { createdBy: userObjectId },
        ],
      })
      .populate('createdBy', 'username email')
      .exec();
  }

  async findMyPolls(userId: string): Promise<Poll[]> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      return [];
    }

    if (user.role === Role.ADMIN) {
      return this.pollModel
        .find()
        .populate('createdBy', 'username email')
        .exec();
    }

    return this.pollModel
      .find({ createdBy: new Types.ObjectId(userId) })
      .populate('createdBy', 'username email')
      .exec();
  }

  async findOne(id: string, userId: string): Promise<Poll> {
    const poll = await this.pollModel
      .findById(id)
      .populate('createdBy', 'username email')
      .exec();

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    const userObjectId = new Types.ObjectId(userId);
    const hasAccess =
      poll.isPublic ||
      poll.createdBy._id.equals(userObjectId) ||
      poll.allowedUsers.some((allowedUserId) => allowedUserId.equals(userObjectId));

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this poll');
    }

    return poll;
  }

  async update(id: string, updatePollDto: UpdatePollDto, userId: string): Promise<Poll> {
    const poll = await this.pollModel.findById(id).exec();

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can update polls');
    }

    if (!poll.isActive) {
      throw new BadRequestException('Cannot update expired polls');
    }

    Object.assign(poll, updatePollDto);
    const updatedPoll = await poll.save();
    this.pollsGateway.emitPollUpdated(updatedPoll);
    return updatedPoll;
  }

  async remove(id: string, userId: string): Promise<void> {
    const poll = await this.pollModel.findById(id).exec();

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can delete polls');
    }

    await this.pollModel.findByIdAndDelete(id).exec();
    this.pollsGateway.emitPollDeleted(id, poll);
  }

  async vote(id: string, voteDto: VoteDto, userId: string): Promise<Poll> {
    const poll = await this.pollModel.findById(id).exec();

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    if (!poll.isActive) {
      throw new BadRequestException('This poll has expired');
    }

    const userObjectId = new Types.ObjectId(userId);
    const hasAccess =
      poll.isPublic ||
      poll.createdBy.equals(userObjectId) ||
      poll.allowedUsers.some((allowedUserId) => allowedUserId.equals(userObjectId));

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this poll');
    }

    const hasVoted = poll.options.some((option) =>
      option.votedBy.some((voterId) => voterId.equals(userObjectId))
    );

    if (hasVoted) {
      throw new BadRequestException('You have already voted in this poll');
    }

    if (voteDto.optionIndex < 0 || voteDto.optionIndex >= poll.options.length) {
      throw new BadRequestException('Invalid option index');
    }

    poll.options[voteDto.optionIndex].votes += 1;
    poll.options[voteDto.optionIndex].votedBy.push(userObjectId);

    const savedPoll = await poll.save();
    this.pollsGateway.emitPollUpdated(savedPoll);
    return savedPoll;
  }

  async getResults(id: string, userId: string): Promise<any> {
    const poll = await this.findOne(id, userId);

    const userObjectId = new Types.ObjectId(userId);
    const userHasVoted = poll.options.some((option) =>
      option.votedBy.some((voterId) => voterId.equals(userObjectId))
    );

    const isCreator = poll.createdBy._id.equals(userObjectId);

    if (!poll.isActive && !poll.isPublic && !isCreator) {
      throw new ForbiddenException('You can only view results of public polls or polls you created');
    }

    const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

    const results = poll.options.map((option) => ({
      text: option.text,
      votes: option.votes,
      percentage: totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(2) : '0.00',
    }));

    return {
      pollId: poll._id,
      title: poll.title,
      description: poll.description,
      totalVotes,
      isActive: poll.isActive,
      expiresAt: poll.expiresAt,
      results,
      userHasVoted,
    };
  }

  async updateAllowedUsers(id: string, allowedUserIds: string[], userId: string): Promise<Poll> {
    const poll = await this.pollModel.findById(id).exec();

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can update polls');
    }

    if (poll.isPublic) {
      throw new BadRequestException('Cannot set allowed users for public polls');
    }

    const uniqueUserIds = [...new Set(allowedUserIds)];
    for (const uid of uniqueUserIds) {
      const userExists = await this.userModel.findById(uid).exec();
      if (!userExists) {
        throw new BadRequestException(`User with ID ${uid} does not exist`);
      }
    }

    const previousAllowedUsers = poll.allowedUsers.map((uid) => uid.toString());
    const newAllowedUsers = allowedUserIds;

    const addedUsers = newAllowedUsers.filter((uid) => !previousAllowedUsers.includes(uid));
    const removedUsers = previousAllowedUsers.filter((uid) => !newAllowedUsers.includes(uid));

    poll.allowedUsers = allowedUserIds.map((uid) => new Types.ObjectId(uid));
    const updatedPoll = await poll.save();

    this.pollsGateway.emitAllowedUsersUpdated(updatedPoll, addedUsers, removedUsers);

    return updatedPoll;
  }
}

import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Poll } from './schemas/poll.schema';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { VoteDto } from './dto/vote.dto';

@Injectable()
export class PollsService {
  constructor(@InjectModel(Poll.name) private pollModel: Model<Poll>) {}

  async create(createPollDto: CreatePollDto, userId: string): Promise<Poll> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + createPollDto.durationMinutes);

    const options = createPollDto.options.map((text) => ({
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

    return poll.save();
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

    if (!poll.createdBy.equals(new Types.ObjectId(userId))) {
      throw new ForbiddenException('You can only update your own polls');
    }

    if (!poll.isActive) {
      throw new BadRequestException('Cannot update expired polls');
    }

    Object.assign(poll, updatePollDto);
    return poll.save();
  }

  async remove(id: string, userId: string): Promise<void> {
    const poll = await this.pollModel.findById(id).exec();

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    if (!poll.createdBy.equals(new Types.ObjectId(userId))) {
      throw new ForbiddenException('You can only delete your own polls');
    }

    await this.pollModel.findByIdAndDelete(id).exec();
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

    return poll.save();
  }

  async getResults(id: string, userId: string): Promise<any> {
    const poll = await this.findOne(id, userId);

    const userObjectId = new Types.ObjectId(userId);
    const userHasVoted = poll.options.some((option) =>
      option.votedBy.some((voterId) => voterId.equals(userObjectId))
    );

    const isCreator = poll.createdBy._id.equals(userObjectId);

    if (!poll.isActive && !userHasVoted && !isCreator) {
      throw new ForbiddenException('You can only view results of polls you participated in');
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
}

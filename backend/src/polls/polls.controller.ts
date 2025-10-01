import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PollsService } from './polls.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { VoteDto } from './dto/vote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('polls')
@UseGuards(JwtAuthGuard)
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createPollDto: CreatePollDto, @CurrentUser() user: any) {
    return this.pollsService.create(createPollDto, user.userId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.pollsService.findAll(user.userId);
  }

  @Get('my-polls')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findMyPolls(@CurrentUser() user: any) {
    return this.pollsService.findMyPolls(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.pollsService.findOne(id, user.userId);
  }

  @Get(':id/results')
  getResults(@Param('id') id: string, @CurrentUser() user: any) {
    return this.pollsService.getResults(id, user.userId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updatePollDto: UpdatePollDto, @CurrentUser() user: any) {
    return this.pollsService.update(id, updatePollDto, user.userId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.pollsService.remove(id, user.userId);
  }

  @Post(':id/vote')
  vote(@Param('id') id: string, @Body() voteDto: VoteDto, @CurrentUser() user: any) {
    return this.pollsService.vote(id, voteDto, user.userId);
  }
}

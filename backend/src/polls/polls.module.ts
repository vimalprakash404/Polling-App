import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PollsService } from './polls.service';
import { PollsController } from './polls.controller';
import { PollsGateway } from './polls.gateway';
import { Poll, PollSchema } from './schemas/poll.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Poll.name, schema: PollSchema },
      { name: User.name, schema: UserSchema },
    ])
  ],
  controllers: [PollsController],
  providers: [PollsService, PollsGateway],
  exports: [PollsGateway],
})
export class PollsModule {}

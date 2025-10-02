import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Types } from 'mongoose';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PollsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('PollsGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(client: Socket, payload: { userId: string }) {
    if (payload.userId) {
      client.data.userId = payload.userId;
      client.join(`user:${payload.userId}`);
      this.logger.log(`Client ${client.id} authenticated as user ${payload.userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitPollUpdated(poll: any) {
    if (poll.isPublic) {
      this.server.emit('pollUpdated', poll);
    } else {
      this.server.to(`user:${poll.createdBy._id || poll.createdBy}`).emit('pollUpdated', poll);

      if (poll.allowedUsers && poll.allowedUsers.length > 0) {
        poll.allowedUsers.forEach((userId: Types.ObjectId) => {
          this.server.to(`user:${userId.toString()}`).emit('pollUpdated', poll);
        });
      }
    }
  }

  emitPollCreated(poll: any) {
    if (poll.isPublic) {
      this.server.emit('pollCreated', poll);
    } else {
      this.server.to(`user:${poll.createdBy._id || poll.createdBy}`).emit('pollCreated', poll);

      if (poll.allowedUsers && poll.allowedUsers.length > 0) {
        poll.allowedUsers.forEach((userId: Types.ObjectId) => {
          this.server.to(`user:${userId.toString()}`).emit('pollCreated', poll);
        });
      }
    }
  }

  emitPollDeleted(pollId: string, poll?: any) {
    if (poll && !poll.isPublic) {
      this.server.to(`user:${poll.createdBy._id || poll.createdBy}`).emit('pollDeleted', pollId);

      if (poll.allowedUsers && poll.allowedUsers.length > 0) {
        poll.allowedUsers.forEach((userId: Types.ObjectId) => {
          this.server.to(`user:${userId.toString()}`).emit('pollDeleted', pollId);
        });
      }
    } else {
      this.server.emit('pollDeleted', pollId);
    }
  }
}

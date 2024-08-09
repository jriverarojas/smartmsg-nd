import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { JwtService } from '@nestjs/jwt';
  
  @WebSocketGateway({
    cors: {
      origin: 'http://localhost:9000', // Cambia esto según sea necesario
      credentials: true,
    },
  })
  export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    constructor(private readonly jwtService: JwtService) {}
  
    async handleConnection(client: Socket) {
      try {
        const token = client.handshake.query.token as string;
        const decoded = this.jwtService.verify(token);
        client.data.user = decoded.sub;
      } catch (err) {
        client.disconnect();
      }
    }
  
    handleDisconnect(client: Socket) {
      console.log(`Client disconnected: ${client.id}`);
    }
  
    @SubscribeMessage('joinThread')
    handleJoinThread(@MessageBody() threadId: string, @ConnectedSocket() client: Socket) {
      client.join(threadId);
      console.log(`Client ${client.id} joined thread ${threadId}`);
    }

    sendMessage(threadId: string, message: any) {
      this.server.to(threadId).emit('newMessage', message);
    }
  }
  
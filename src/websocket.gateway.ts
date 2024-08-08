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
        console.log('CONNECTIONNNNN');
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
  
    @SubscribeMessage('message')
    handleMessage(@MessageBody() message: string, @ConnectedSocket() client: Socket): void {
      // Aquí puedes manejar la recepción de mensajes del cliente
      console.log(`Message from ${client.data.user}: ${message}`);
    }
  
    sendMessageToClient(userId: string, message: string) {
      this.server.to(userId).emit('newMessage', message);
    }
  }
  
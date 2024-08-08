import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { MessageService } from '../service/message.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { Message } from '../entities/message.entity';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissions } from 'src/auth/decorators/permissions.decorator';

@Controller('messages')
@UseGuards(PermissionsGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @Permissions('createMessage')
  create(@Body() createMessageDto: CreateMessageDto): Promise<Message> {
    return this.messageService.create(createMessageDto);
  }

  @Get()
  @Permissions('listMessage')
  findAll(): Promise<Message[]> {
    return this.messageService.findAll();
  }

  @Get(':id')
  @Permissions('listMessage')
  findOne(@Param('id') id: number): Promise<Message> {
    return this.messageService.findOne(+id);
  }

  @Put(':id')
  @Permissions('updateMessage')
  update(@Param('id') id: number, @Body() updateMessageDto: UpdateMessageDto): Promise<Message> {
    return this.messageService.update(+id, updateMessageDto);
  }

  @Delete(':id')
  @Permissions('deleteMessage')
  remove(@Param('id') id: number): Promise<void> {
    return this.messageService.remove(+id);
  }
}

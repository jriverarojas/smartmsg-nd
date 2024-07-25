import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto): Promise<Message> {
    return this.messageService.create(createMessageDto);
  }

  @Get()
  findAll(): Promise<Message[]> {
    return this.messageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Message> {
    return this.messageService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateMessageDto: UpdateMessageDto): Promise<Message> {
    return this.messageService.update(+id, updateMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.messageService.remove(+id);
  }
}

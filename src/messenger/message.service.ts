import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { AssistantService } from './assistant.service';
import { ThreadService } from './thread.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly assistantService: AssistantService,
    private readonly threadService: ThreadService,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messageRepository.create(createMessageDto);

    if (createMessageDto.assistantId) {
      const assistant = await this.assistantService.findOne(createMessageDto.assistantId);
      message.assistant = assistant;
    }

    if (createMessageDto.threadId) {
      const thread = await this.threadService.findOne(createMessageDto.threadId);
      message.thread = thread;
    }

    return this.messageRepository.save(message);
  }

  async findAll(): Promise<Message[]> {
    return this.messageRepository.find({ relations: ['assistant', 'thread'] });
  }

  async findOne(id: number): Promise<Message> {
    return this.messageRepository.findOne({ where: { id }, relations: ['assistant', 'thread'] });
  }

  async update(id: number, updateMessageDto: UpdateMessageDto): Promise<Message> {
    const message = await this.findOne(id);

    if (updateMessageDto.assistantId) {
      const assistant = await this.assistantService.findOne(updateMessageDto.assistantId);
      message.assistant = assistant;
    }

    if (updateMessageDto.threadId) {
      const thread = await this.threadService.findOne(updateMessageDto.threadId);
      message.thread = thread;
    }

    Object.assign(message, updateMessageDto);

    return this.messageRepository.save(message);
  }

  async remove(id: number): Promise<void> {
    const message = await this.findOne(id);
    await this.messageRepository.remove(message);
  }
}
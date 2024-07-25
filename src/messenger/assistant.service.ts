import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assistant } from './entities/assistant.entity';
import { UserService } from '../auth/user.service';
import { CreateAssistantDto } from './dto/create-assistant.dto';
import { UpdateAssistantDto } from './dto/update-assistant.dto';

@Injectable()
export class AssistantService {
  constructor(
    @InjectRepository(Assistant)
    private readonly assistantRepository: Repository<Assistant>,
    private readonly usersService: UserService,
  ) {}

  async create(createAssistantDto: CreateAssistantDto): Promise<Assistant> {
    const assistant = this.assistantRepository.create(createAssistantDto);

    if (createAssistantDto.userId) {
      const user = await this.usersService.findOne(createAssistantDto.userId);
      assistant.user = user;
    }

    return this.assistantRepository.save(assistant);
  }

  async findAll(): Promise<Assistant[]> {
    return this.assistantRepository.find({ relations: ['user', 'categories', 'threads'] });
  }

  async findOne(id: number): Promise<Assistant> {
    return this.assistantRepository.findOne({ where: { id }, relations: ['user', 'categories', 'threads'] });
  }

  async update(id: number, updateAssistantDto: UpdateAssistantDto): Promise<Assistant> {
    const assistant = await this.findOne(id);

    if (updateAssistantDto.userId) {
      const user = await this.usersService.findOne(updateAssistantDto.userId);
      assistant.user = user;
    }

    Object.assign(assistant, updateAssistantDto);

    return this.assistantRepository.save(assistant);
  }

  async remove(id: number): Promise<void> {
    const assistant = await this.findOne(id);
    await this.assistantRepository.remove(assistant);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assistant } from '../entities/assistant.entity';
import { UserService } from '../../auth/service/user.service';
import { CreateAssistantDto } from '../dto/create-assistant.dto';
import { UpdateAssistantDto } from '../dto/update-assistant.dto';
import { InstanceAssistant } from '../entities/instance-assistant.entity';
import { EncryptionService } from 'src/auth/service/encryption.service';

@Injectable()
export class AssistantService {
  //x: string]: any;
  constructor(
    @InjectRepository(Assistant) private readonly assistantRepository: Repository<Assistant>,
    @InjectRepository(InstanceAssistant) private readonly instanceAssistantRepository: Repository<InstanceAssistant>,
    private readonly encryptionService: EncryptionService,
    private readonly usersService: UserService,
  ) {}

  async create(createAssistantDto: CreateAssistantDto): Promise<Assistant> {
    createAssistantDto.config = this.encryptionService.encrypt(createAssistantDto.config);
    const assistant = this.assistantRepository.create(createAssistantDto);
    console.log('llega1');
    
    if (createAssistantDto.userId) {
      const user = await this.usersService.findOne(createAssistantDto.userId);
      assistant.user = user;
    }
    console.log('llega2');
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

    if (updateAssistantDto.config) {
      updateAssistantDto.config = this.encryptionService.encrypt(updateAssistantDto.config);
    }

    if (updateAssistantDto.userId) {
      const user = await this.usersService.findOne(updateAssistantDto.userId);
      assistant.user = user;
    }

    Object.assign(assistant, updateAssistantDto);

    return this.assistantRepository.save(assistant);
  }

  private async getDefaultAssistant(instanceId: number): Promise<Assistant | undefined> {
    const instanceAssistant = await this.instanceAssistantRepository.findOne({
      where: { instanceId, isDefault: true },
      relations: ['assistant'],
    });

    return instanceAssistant ? instanceAssistant.assistant : undefined;
  }

  async getAssistant(instanceId: number, categoryId: number | null): Promise<Assistant | undefined> {
    if (categoryId === null || categoryId === undefined) {
      return this.getDefaultAssistant(instanceId);
    }

    const assistant = await this.assistantRepository.createQueryBuilder('assistant')
      .innerJoin('assistant.instanceAssistants', 'instanceAssistant', 'instanceAssistant.instanceId = :instanceId', { instanceId })
      .where('assistant.categoryId = :categoryId', { categoryId })
      .andWhere('assistant.working = :working', { working: 'Y' })
      .getOne();

    if (assistant) {
      return assistant;
    }

    return this.getDefaultAssistant(instanceId);
  }

  async remove(id: number): Promise<void> {
    const assistant = await this.findOne(id);
    await this.assistantRepository.remove(assistant);
  }
}

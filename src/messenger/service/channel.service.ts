import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { UpdateChannelDto } from '../dto/update-channel.dto';
import { Channel } from '../entities/channel.entity';
import { EncryptionService } from 'src/auth/service/encryption.service';


@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    private readonly encryptionService: EncryptionService,
  ) {}

  async create(createChannelDto: CreateChannelDto): Promise<Channel> {
    createChannelDto.config = this.encryptionService.encrypt(createChannelDto.config);
    const channel = this.channelRepository.create(createChannelDto);
    return this.channelRepository.save(channel);
  }

  async findAll(): Promise<Channel[]> {
    return this.channelRepository.find();
  }

  async findOne(id: number): Promise<Channel> {
    const channel = await this.channelRepository.findOne({ where: { id } });
    if (!channel) {
      throw new NotFoundException(`Channel with ID ${id} not found`);
    }
    return channel;
  }

  async update(id: number, updateChannelDto: UpdateChannelDto): Promise<Channel> {
    const channel = await this.findOne(id);
    updateChannelDto.config = this.encryptionService.encrypt(updateChannelDto.config);
    Object.assign(channel, updateChannelDto);
    return this.channelRepository.save(channel);
  }

  async remove(id: number): Promise<void> {
    const channel = await this.findOne(id);
    await this.channelRepository.remove(channel);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Thread } from './entities/thread.entity';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';

@Injectable()
export class ThreadService {
  constructor(
    @InjectRepository(Thread)
    private readonly threadRepository: Repository<Thread>,
  ) {}

  async create(createThreadDto: CreateThreadDto): Promise<Thread> {
    const thread = this.threadRepository.create(createThreadDto);
    return this.threadRepository.save(thread);
  }

  async findAll(): Promise<Thread[]> {
    return this.threadRepository.find({ relations: ['channel', 'category', 'messages'] });
  }

  async findOne(id: number): Promise<Thread> {
    return this.threadRepository.findOne({ where: { id }, relations: ['channel', 'category', 'messages'] });
  }

  async update(id: number, updateThreadDto: UpdateThreadDto): Promise<Thread> {
    const thread = await this.findOne(id);

    Object.assign(thread, updateThreadDto);

    return this.threadRepository.save(thread);
  }

  async remove(id: number): Promise<void> {
    const thread = await this.findOne(id);
    await this.threadRepository.remove(thread);
  }
}

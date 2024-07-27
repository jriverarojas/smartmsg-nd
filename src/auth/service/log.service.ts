import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from '../entities/log.entity';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
  ) {}

  async create(log: Partial<Log>): Promise<Log> {
    const newLog = this.logRepository.create(log);
    return this.logRepository.save(newLog);
  }
}

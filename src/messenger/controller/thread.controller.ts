import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ThreadService } from '../service/thread.service';
import { CreateThreadDto } from '../dto/create-thread.dto';
import { UpdateThreadDto } from '../dto/update-thread.dto';
import { Thread } from '../entities/thread.entity';

@Controller('threads')
export class ThreadController {
  constructor(private readonly threadService: ThreadService) {}

  @Post()
  create(@Body() createThreadDto: CreateThreadDto): Promise<Thread> {
    return this.threadService.create(createThreadDto);
  }

  @Get()
  findAll(): Promise<Thread[]> {
    return this.threadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Thread> {
    return this.threadService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateThreadDto: UpdateThreadDto): Promise<Thread> {
    return this.threadService.update(+id, updateThreadDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.threadService.remove(+id);
  }
}

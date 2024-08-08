import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ThreadService } from '../service/thread.service';
import { CreateThreadDto } from '../dto/create-thread.dto';
import { UpdateThreadDto } from '../dto/update-thread.dto';
import { Thread } from '../entities/thread.entity';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissions } from 'src/auth/decorators/permissions.decorator';

@Controller('threads')
@UseGuards(PermissionsGuard)
export class ThreadController {
  constructor(private readonly threadService: ThreadService) {}

  @Post()
  @Permissions('createThread')
  create(@Body() createThreadDto: CreateThreadDto): Promise<Thread> {
    return this.threadService.create(createThreadDto);
  }

  @Get()
  @Permissions('listThread')
  findAll(): Promise<Thread[]> {
    return this.threadService.findAll();
  }

  @Get(':id')
  @Permissions('listThread')
  findOne(@Param('id') id: number): Promise<Thread> {
    return this.threadService.findOne(+id);
  }

  @Put(':id')
  @Permissions('updateThread')
  update(@Param('id') id: number, @Body() updateThreadDto: UpdateThreadDto): Promise<Thread> {
    return this.threadService.update(+id, updateThreadDto);
  }

  @Delete(':id')
  @Permissions('deleteThread')
  remove(@Param('id') id: number): Promise<void> {
    return this.threadService.remove(+id);
  }
}

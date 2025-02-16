import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ChannelService } from '../service/channel.service';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { UpdateChannelDto } from '../dto/update-channel.dto';
import { Channel } from '../entities/channel.entity';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';

@Controller('channels')
@UseGuards(PermissionsGuard)
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post()
  @Permissions('createChannel')
  create(@Body() createChannelDto: CreateChannelDto): Promise<Channel> {
    return this.channelService.create(createChannelDto);
  }

  @Get()
  findAll(): Promise<Channel[]> {
    return this.channelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Channel> {
    return this.channelService.findOne(+id);
  }

  @Put(':id')
  @Permissions('updateChannel')
  update(@Param('id') id: number, @Body() updateChannelDto: UpdateChannelDto): Promise<Channel> {
    return this.channelService.update(+id, updateChannelDto);
  }

  @Delete(':id')
  @Permissions('deleteChannel')
  remove(@Param('id') id: number): Promise<void> {
    return this.channelService.remove(+id);
  }
}

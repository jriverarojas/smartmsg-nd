import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { AssistantService } from '../service/assistant.service';
import { CreateAssistantDto } from '../dto/create-assistant.dto';
import { UpdateAssistantDto } from '../dto/update-assistant.dto';
import { Assistant } from '../entities/assistant.entity';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissions } from 'src/auth/decorators/permissions.decorator';

@Controller('assistants')
@UseGuards(PermissionsGuard)
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post()
  @Permissions('createAssistant')
  create(@Body() createAssistantDto: CreateAssistantDto): Promise<Assistant> {
    return this.assistantService.create(createAssistantDto);
  }

  @Get()
  @Permissions('listAssistant')
  findAll(): Promise<Assistant[]> {
    return this.assistantService.findAll();
  }

  @Get(':id')
  @Permissions('listAssistant')
  findOne(@Param('id') id: number): Promise<Assistant> {
    return this.assistantService.findOne(+id);
  }

  @Put(':id')
  @Permissions('updateAssistant')
  update(@Param('id') id: number, @Body() updateAssistantDto: UpdateAssistantDto): Promise<Assistant> {
    return this.assistantService.update(+id, updateAssistantDto);
  }

  @Delete(':id')
  @Permissions('deleteAssistant')
  remove(@Param('id') id: number): Promise<void> {
    return this.assistantService.remove(+id);
  }
}

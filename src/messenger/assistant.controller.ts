import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { CreateAssistantDto } from './dto/create-assistant.dto';
import { UpdateAssistantDto } from './dto/update-assistant.dto';
import { Assistant } from './entities/assistant.entity';

@Controller('assistants')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post()
  create(@Body() createAssistantDto: CreateAssistantDto): Promise<Assistant> {
    return this.assistantService.create(createAssistantDto);
  }

  @Get()
  findAll(): Promise<Assistant[]> {
    return this.assistantService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Assistant> {
    return this.assistantService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateAssistantDto: UpdateAssistantDto): Promise<Assistant> {
    return this.assistantService.update(+id, updateAssistantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.assistantService.remove(+id);
  }
}

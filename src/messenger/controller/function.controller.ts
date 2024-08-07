import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { CreateFunctionDto } from '../dto/create-function.dto';
import { UpdateFunctionDto } from '../dto/update-function.dto';
import { FunctionService } from '../service/function.service';

@Controller('functions')
export class FunctionController {
  constructor(private readonly functionService: FunctionService) {}

  @Post()
  create(@Body() createFunctionDto: CreateFunctionDto) {
    return this.functionService.create(createFunctionDto);
  }

  @Get()
  findAll() {
    return this.functionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.functionService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateFunctionDto: UpdateFunctionDto) {
    return this.functionService.update(+id, updateFunctionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.functionService.remove(+id);
  }
}

import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { CreateFunctionDto } from '../dto/create-function.dto';
import { UpdateFunctionDto } from '../dto/update-function.dto';
import { FunctionService } from '../service/function.service';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissions } from 'src/auth/decorators/permissions.decorator';

@Controller('functions')
@UseGuards(PermissionsGuard)
export class FunctionController {
  constructor(private readonly functionService: FunctionService) {}

  @Post()
  @Permissions('createFunction')
  create(@Body() createFunctionDto: CreateFunctionDto) {
    return this.functionService.create(createFunctionDto);
  }

  @Get()
  @Permissions('listFunction')
  findAll() {
    return this.functionService.findAll();
  }

  @Get(':id')
  @Permissions('listFunction')
  findOne(@Param('id') id: string) {
    return this.functionService.findOne(+id);
  }

  @Put(':id')
  @Permissions('updateFunction')
  update(@Param('id') id: string, @Body() updateFunctionDto: UpdateFunctionDto) {
    return this.functionService.update(+id, updateFunctionDto);
  }

  @Delete(':id')
  @Permissions('deleteFunction')
  remove(@Param('id') id: string) {
    return this.functionService.remove(+id);
  }
}

import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateAssistantDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsBoolean()
  active: boolean;

  @IsBoolean()
  isAutomatic: boolean;

  @IsString()
  @IsNotEmpty()
  working: string;

  @IsString()
  config: string;

  @IsOptional()
  userId?: number;

  @IsOptional()
  categoryIds?: number[];
}

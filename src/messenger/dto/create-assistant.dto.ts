import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateAssistantDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsBoolean()
  active: boolean;

  @IsString()
  @IsNotEmpty()
  working: string;

  @IsOptional()
  userId?: number;

  @IsOptional()
  categoryIds?: number[];
}

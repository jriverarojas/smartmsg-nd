import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateAssistantDto {
  @IsString()
  @IsOptional()
  type?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsBoolean()
  @IsOptional()
  isAutomatic: boolean;

  @IsString()
  @IsOptional()
  working?: string;

  @IsOptional()
  userId?: number;

  @IsString()
  @IsOptional()
  config: string;

  @IsOptional()
  categoryIds?: number[];
}

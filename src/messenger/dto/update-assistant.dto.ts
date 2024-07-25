import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateAssistantDto {
  @IsString()
  @IsOptional()
  type?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsString()
  @IsOptional()
  working?: string;

  @IsOptional()
  userId?: number;

  @IsOptional()
  categoryIds?: number[];
}

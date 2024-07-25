import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class UpdateChannelDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  config?: string;

  @IsNumber()
  @IsOptional()
  expiresIn?: number;
}

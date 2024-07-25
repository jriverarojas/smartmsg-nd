import { IsString, IsOptional, IsDate } from 'class-validator';

export class UpdateThreadDto {
  @IsString()
  @IsOptional()
  externalId?: string;

  @IsString()
  @IsOptional()
  origin?: string;

  @IsDate()
  @IsOptional()
  expirationDate?: Date;

  @IsString()
  @IsOptional()
  channelId?: number;

  @IsString()
  @IsOptional()
  categoryId?: number;
}

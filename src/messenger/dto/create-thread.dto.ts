import { IsString, IsNotEmpty, IsDate, IsOptional } from 'class-validator';

export class CreateThreadDto {
  @IsString()
  @IsNotEmpty()
  externalId: string;

  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsDate()
  expirationDate: Date;

  @IsString()
  @IsNotEmpty()
  channelId: number;

  @IsString()
  @IsOptional()
  categoryId?: number;
}

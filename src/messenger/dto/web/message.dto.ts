// src/dto/message.dto.ts
import { IsString, IsIn, IsOptional } from 'class-validator';

export class MessageDto {
  @IsString()
  toFrom: string;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  refId: string;

  @IsString()
  instance: string;

  @IsIn(['out', 'in'])
  type: string;
}

// src/dto/outgoing-message.dto.ts
import { IsString, IsUrl, IsIn } from 'class-validator';

export class OutgoingMessageDto {
  @IsString()
  toFrom: string;

  @IsString()
  message: string;

  @IsString()
  instance: string;

  @IsIn(['out'])
  type: string;

  @IsUrl()
  sendUrl: string;

  @IsString()
  apiKey: string;
}

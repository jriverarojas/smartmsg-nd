// src/dto/incoming-message.dto.ts
import { IsIn, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MessageData {
  @IsString()
  from: string;

  @IsString()
  to: string;

  @IsString()
  body: string;
}

export class IncomingMessageDto {
  @IsString()
  instance: string;

  @IsIn(['in'])
  type: string;

  @ValidateNested()
  @Type(() => MessageData)
  data: {
    message: MessageData;
  };
}

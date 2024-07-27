import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MessageData {
  @IsString()
  to: string;

  @IsString()
  from: string;

  @IsString()
  body: string;

  @IsString()
  instance: string;
}

class Data {
  @ValidateNested()
  @Type(() => MessageData)
  message: MessageData;
}

export class IncomingMessageDto {
  @IsString()
  id: string;

  @ValidateNested()
  @Type(() => Data)
  data: Data;
}

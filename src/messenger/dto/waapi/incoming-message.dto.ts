import { IsString, ValidateNested, IsNumber, IsBoolean, IsArray, IsOptional, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class MessageId {
  @IsString()
  fromMe: boolean;

  @IsString()
  remote: string;

  @IsString()
  id: string;

  @IsString()
  _serialized: string;
}

class MessageData {
  @ValidateNested()
  @Type(() => MessageId)
  @IsObject()
  id: MessageId;

  @IsNumber()
  ack: number;

  @IsBoolean()
  hasMedia: boolean;

  @IsString()
  body: string;

  @IsString()
  type: string;

  @IsNumber()
  timestamp: number;

  @IsString()
  from: string;

  @IsString()
  to: string;

  @IsString()
  deviceType: string;

  @IsNumber()
  forwardingScore: number;

  @IsBoolean()
  isStatus: boolean;

  @IsBoolean()
  isStarred: boolean;

  @IsBoolean()
  fromMe: boolean;

  @IsBoolean()
  hasQuotedMsg: boolean;

  @IsBoolean()
  hasReaction: boolean;

  @IsArray()
  @IsOptional()
  vCards: string[];

  @IsArray()
  @IsOptional()
  mentionedIds: string[];

  @IsArray()
  @IsOptional()
  groupMentions: string[];

  @IsBoolean()
  isGif: boolean;

  @IsArray()
  @IsOptional()
  links: string[];

  @IsObject()
  @IsOptional()
  _data: any; // or specify the exact type if known
}

class Data {
  @ValidateNested()
  @Type(() => MessageData)
  message: MessageData;

  @IsOptional()
  @IsObject()
  media: any; // or specify the exact type if known
}

export class IncomingMessageDto {
  @IsString()
  id: string;

  @IsString()
  event: string;

  @IsString()
  instanceId: string;

  @ValidateNested()
  @Type(() => Data)
  data: Data;

  @IsString()
  type: string;

  @IsString()
  channel: string;

  @IsString()
  instance: string;
}

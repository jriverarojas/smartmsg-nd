import { IsString, IsOptional, IsIn, IsDate } from 'class-validator';

export class UpdateMessageDto {
  @IsString()
  @IsOptional()
  message?: string;

  @IsDate()
  @IsOptional()
  dateCreated?: Date;

  @IsString()
  @IsOptional()
  runId?: string;

  @IsString()
  @IsOptional()
  @IsIn(['processing', 'done'])
  status?: string;

  @IsString()
  @IsOptional()
  queueId?: string;

  @IsString()
  @IsOptional()
  @IsIn(['incoming', 'outgoing'])
  type?: string;

  @IsString()
  @IsOptional()
  assistantId?: number;

  @IsString()
  @IsOptional()
  threadId?: number;
}

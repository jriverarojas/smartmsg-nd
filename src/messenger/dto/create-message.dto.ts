import { IsString, IsNotEmpty, IsDate, IsIn } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsDate()
  dateCreated: Date;

  @IsString()
  @IsNotEmpty()
  runId: string;

  @IsString()
  @IsIn(['processing', 'done'])
  status: string;

  @IsString()
  @IsNotEmpty()
  queueId: string;

  @IsString()
  @IsIn(['incoming', 'outgoing'])
  type: string;

  @IsString()
  assistantId: number;

  @IsString()
  threadId: number;
}

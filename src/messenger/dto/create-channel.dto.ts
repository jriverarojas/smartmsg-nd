import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  config: string;

  @IsNumber()
  @IsNotEmpty()
  expiresIn: number;
}

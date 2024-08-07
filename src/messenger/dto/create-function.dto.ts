import { IsString, IsNotEmpty, IsIn, IsBoolean, IsNumber } from 'class-validator';

export class CreateFunctionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  params: string;

  @IsString()
  @IsNotEmpty()
  headers: string;

  @IsString()
  @IsIn(['GET', 'POST', 'PUT', 'DELETE'])
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';

  @IsString()
  @IsIn(['xml', 'json'])
  responseType: 'xml' | 'json';

  @IsBoolean()
  sendBodyParams: boolean;

  @IsString()
  @IsNotEmpty()
  templateSource: string;

  @IsNumber()
  @IsNotEmpty()
  assistantId: number;
}

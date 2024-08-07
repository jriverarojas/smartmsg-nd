import { IsString, IsNotEmpty, IsIn, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class UpdateFunctionDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  url?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  params?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  headers?: string;

  @IsString()
  @IsIn(['GET', 'POST', 'PUT', 'DELETE'])
  @IsOptional()
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';

  @IsString()
  @IsIn(['xml', 'json'])
  @IsOptional()
  responseType?: 'xml' | 'json';

  @IsBoolean()
  @IsOptional()
  sendBodyParams?: boolean;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  templateSource?: string;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  assistantId?: number;
}

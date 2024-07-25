import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsString()
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  readonly password: string;

  @IsBoolean()
  @IsOptional()
  readonly isApiUser?: boolean;

  @IsString()
  @IsOptional()
  readonly apiKey?: string;
}

import { IsString, IsEmail, IsOptional, IsBoolean, ValidateIf } from 'class-validator';
import { IsPasswordRequired } from './custom-validators';

export class CreateUserDto {
  @IsString()
  readonly name: string;

  @IsEmail()
  readonly email: string;
  
  @ValidateIf(o => !o.isApiUser)
  @IsString()
  @IsPasswordRequired({
    message: 'Password is required unless the user is an API user.',
  })
  readonly password: string;

  @IsBoolean()
  readonly isApiUser: boolean;

  @IsString()
  @IsOptional()
  readonly apiKey?: string;
}

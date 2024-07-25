import { IsString } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  readonly currentPassword: string;

  @IsString()
  readonly newPassword: string;
}

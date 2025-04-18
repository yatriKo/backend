import { IsEmail, IsString } from 'class-validator';

export class UserLogInDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly password: string;
}

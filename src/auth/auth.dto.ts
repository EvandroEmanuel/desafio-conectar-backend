export class AuthResponseDto {
  token: string;
  expiresIn: number;
  lastLogin?: Date;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from 'src/utils/enum/user-role.enum';

export class CreateUsersDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  password: string;

  @ApiPropertyOptional({ example: 'admin | user', default: 'user' })
  @IsOptional()
  @IsEnum(UserRole, {
    message: 'role must be admin or user',
  })
  role?: UserRole;
}

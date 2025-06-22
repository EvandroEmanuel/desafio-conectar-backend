import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { UserRole } from 'src/utils/enum/user-role.enum';

export class UpdateUsersDto {
  @ApiProperty({ example: 'John Castle' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'john123' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'admin | user' })
  @IsEnum(UserRole, {
    message: 'role must be admin or user',
  })
  role: UserRole;

  @ApiProperty({ example: 'true | false' })
  @IsBoolean()
  isActive: boolean;
}

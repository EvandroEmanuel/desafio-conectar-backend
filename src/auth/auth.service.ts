import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { compareSync as bcryptCompareSync } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/db/entities/user.entity';
import { Repository } from 'typeorm';
import { AuthResponseDto } from './auth.dto';

@Injectable()
export class AuthService {
  private readonly jwtExpirationTimeInSeconds: number;
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const expiration = this.configService.get<number>('JWT_EXPIRATION_TIME');

    if (!expiration) {
      throw new Error(
        'JWT_EXPIRATION_TIME não está definido nas variáveis de ambiente',
      );
    }

    this.jwtExpirationTimeInSeconds = +expiration;
  }
  async signIn(email: string, password: string): Promise<AuthResponseDto> {
    const foundUser = await this.usersService.findByUserEmail(email);

    if (!foundUser || !bcryptCompareSync(password, foundUser.password)) {
      throw new UnauthorizedException('email ou senha inválidos!');
    }

    const payload = {
      sub: foundUser.id,
      name: foundUser.name,
      role: foundUser.role,
    };
    const token = this.jwtService.sign(payload);

    foundUser.lastLogin = new Date();
    await this.userRepository.save(foundUser);

    return { token, expiresIn: this.jwtExpirationTimeInSeconds };
  }
}

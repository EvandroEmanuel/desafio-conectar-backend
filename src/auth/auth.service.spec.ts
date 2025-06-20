import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from 'src/db/entities/user.entity';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/utils/enum/user-role.enum';

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  password: bcrypt.hashSync('password123', 10),
  role: UserRole.ADMIN,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLogin: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;
  let configService: Partial<ConfigService>;
  let userRepository: Partial<Repository<UserEntity>>;

  beforeEach(async () => {
    usersService = {
      findByUserEmail: jest.fn().mockResolvedValue(mockUser),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked_jwt_token'),
    };

    configService = {
      get: jest.fn().mockReturnValue(3600),
    };

    userRepository = {
      save: jest.fn().mockResolvedValue(mockUser),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: getRepositoryToken(UserEntity), useValue: userRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should sign in a valid user and return token', async () => {
    const result = await service.signIn('test@example.com', 'password123');

    expect(usersService.findByUserEmail).toHaveBeenCalledWith(
      'test@example.com',
    );
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: mockUser.id,
      name: mockUser.name,
      role: mockUser.role,
    });
    expect(userRepository.save).toHaveBeenCalledWith({
      ...mockUser,
      lastLogin: expect.any(Date),
    });
    expect(result).toEqual({ token: 'mocked_jwt_token', expiresIn: 3600 });
  });

  it('should throw UnauthorizedException if email is invalid', async () => {
    jest
      .spyOn(usersService, 'findByUserEmail')
      .mockResolvedValue(undefined as any);

    await expect(
      service.signIn('invalid@example.com', 'password123'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if password is invalid', async () => {
    jest
      .spyOn(usersService, 'findByUserEmail')
      .mockResolvedValue({ ...mockUser, password: 'wronghash' });

    await expect(
      service.signIn('test@example.com', 'wrongpassword'),
    ).rejects.toThrow(UnauthorizedException);
  });
});

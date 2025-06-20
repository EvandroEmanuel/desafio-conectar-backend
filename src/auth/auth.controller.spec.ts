import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './auth.dto';
import { HttpStatus } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signIn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should call authService.signIn with email and password and return token', async () => {
      const email = 'john.doe@example.com';
      const password = 'john123';

      const expectedResponse: AuthResponseDto = {
        token: 'mocked.jwt.token',
        expiresIn: 3600,
      };

      mockAuthService.signIn.mockResolvedValue(expectedResponse);

      const result = await controller.singIn(email, password);

      expect(authService.signIn).toHaveBeenCalledWith(email, password);
      expect(result).toEqual(expectedResponse);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { CreateUsersDto } from './dto/create-users.dto';
import { UpdateUsersDto } from './dto/update-users.dto';
import { UserRole } from 'src/utils/enum/user-role.enum';

class MockAuthGuard {
  canActivate() {
    return true;
  }
}
class MockRolesGuard {
  canActivate() {
    return true;
  }
}

const mockUsersService = {
  createUser: jest.fn(),
  findAll: jest.fn(),
  findUserById: jest.fn(),
  findInactiveUsers: jest.fn(),
  updateUser: jest.fn(),
  delete: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    })
      .overrideGuard(AuthGuard)
      .useClass(MockAuthGuard)
      .overrideGuard(RolesGuard)
      .useClass(MockRolesGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Teste criação do usuário
  describe('create', () => {
    it('should call usersService.createUser with dto', async () => {
      const dto: CreateUsersDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'john123',
        role: UserRole.USER, // ajuste se usar enum
      };
      mockUsersService.createUser.mockResolvedValue({ id: '1', ...dto });

      const result = await controller.create(dto);

      expect(mockUsersService.createUser).toHaveBeenCalledWith(dto);
      expect(result).toHaveProperty('id', '1');
      expect(result).toHaveProperty('email', dto.email);
    });
  });

  // Teste findAll
  describe('findAll', () => {
    it('should call usersService.findAll with query params', async () => {
      const query = { search: 'john' };
      const mockResponse = { data: [], count: 0 };
      mockUsersService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(query);

      expect(mockUsersService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResponse);
    });
  });

  // Teste findUserById (usuário logado)
  describe('findUserById', () => {
    it('should call usersService.findUserById with req.user.sub', async () => {
      const userId = '123';
      const req = { user: { sub: userId } };
      const mockUser = { id: userId, name: 'John' };
      mockUsersService.findUserById.mockResolvedValue(mockUser);

      const result = await controller.findUserById(req);

      expect(mockUsersService.findUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });
  });

  // Teste findInactiveUsers
  describe('findInactiveUsers', () => {
    it('should call usersService.findInactiveUsers', async () => {
      const mockUsers = [{ id: '1', name: 'Inactive User' }];
      mockUsersService.findInactiveUsers.mockResolvedValue(mockUsers);

      const result = await controller.findInactiveUsers();

      expect(mockUsersService.findInactiveUsers).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  // Teste updateUser (usuário logado)
  describe('updateUser', () => {
    it('should call usersService.updateUser with req.user.sub and dto', async () => {
      const userId = '123';
      const req = { user: { sub: userId } };
      const dto: UpdateUsersDto = {
        name: 'John Updated',
        password: 'newpass',
        role: UserRole.USER,
        isActive: true,
      };
      const updatedUser = { id: userId, ...dto };
      mockUsersService.updateUser.mockResolvedValue(updatedUser);

      const result = await controller.updateUser(req, dto);

      expect(mockUsersService.updateUser).toHaveBeenCalledWith(userId, dto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('update', () => {
    it('should call usersService.updateUser with id and dto', async () => {
      const userId = 'admin-id';
      const dto: UpdateUsersDto = {
        name: 'Admin Update',
        password: 'adminpass',
        role: UserRole.ADMIN,
        isActive: true,
      };
      const updatedUser = { id: userId, ...dto };
      mockUsersService.updateUser.mockResolvedValue(updatedUser);

      const result = await controller.update(userId, dto);

      expect(mockUsersService.updateUser).toHaveBeenCalledWith(userId, dto);
      expect(result).toEqual(updatedUser);
    });
  });

  // Teste delete
  describe('delete', () => {
    it('should call usersService.delete with id', async () => {
      const userId = 'del-id';
      const mockResponse = { message: 'Usuário deletado com sucesso' };
      mockUsersService.delete.mockResolvedValue(mockResponse);

      const result = await controller.delete(userId);

      expect(mockUsersService.delete).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockResponse);
    });
  });
});

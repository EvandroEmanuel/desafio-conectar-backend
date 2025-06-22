import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from 'src/db/entities/user.entity';
import { Repository } from 'typeorm';
import { UtilsService } from 'src/utils/utils.service';
import * as bcrypt from 'bcrypt';
import { HttpException } from '@nestjs/common';
import { CreateUsersDto } from './dto/create-users.dto';
import { UserRole } from 'src/utils/enum/user-role.enum';
import { UpdateUsersDto } from './dto/update-users.dto';

const mockUserRepository = () => ({
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
  merge: jest.fn(),
  remove: jest.fn(),
});

const mockUtilsService = {
  applyGlobalFilters: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<UserEntity>>;
  let utilsService: typeof mockUtilsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useFactory: mockUserRepository,
        },
        {
          provide: UtilsService,
          useValue: mockUtilsService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(UserEntity));
    utilsService = module.get(UtilsService);
  });

  // #region createUser
  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const dto: CreateUsersDto = {
        name: 'John',
        email: 'john@mail.com',
        password: '123456',
        role: UserRole.USER,
      };

      repository.findOne.mockResolvedValue(undefined as any);
      repository.create.mockReturnValue(dto as any);
      repository.save.mockResolvedValue(dto as any);
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(
          async (password: string, saltOrRounds: number) => 'hashedPassword',
        );

      const result = await service.createUser(dto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('name', dto.name);
      expect(result).toHaveProperty('email', dto.email);
      expect(result).toHaveProperty('role', dto.role);
      expect(result).toHaveProperty('createdAt');
    });

    it('should throw error if email already exists', async () => {
      repository.findOne.mockResolvedValue({} as UserEntity);
      await expect(service.createUser({} as any)).rejects.toThrow(
        HttpException,
      );
    });
  });
  // #endregion

  // #region findByUserEmail
  describe('findByUserEmail', () => {
    it('should return a user by email', async () => {
      const mockUser = { id: '1', email: 'test@mail.com' } as UserEntity;
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByUserEmail('test@mail.com');

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@mail.com' },
      });
    });
  });
  // #endregion

  // #region findAll
  describe('findAll', () => {
    it('should return list of users and count', async () => {
      const qbMock = {
        getManyAndCount: jest.fn().mockResolvedValue([
          [
            {
              id: '1',
              name: 'John',
              email: 'john@mail.com',
              role: 'user',
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          1,
        ]),
      };
      utilsService.applyGlobalFilters.mockResolvedValue(qbMock);

      const result = await service.findAll({ search: '' });

      expect(utilsService.applyGlobalFilters).toHaveBeenCalled();
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('count');
      expect(result.data[0]).toHaveProperty('name', 'John');
    });
  });
  // #endregion

  // #region findUserById
  describe('findUserById', () => {
    it('should return a user if found', async () => {
      const mockUser = {
        id: '1',
        name: 'John',
        email: 'john@mail.com',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as UserEntity;
      repository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findUserById('1');

      expect(result).toHaveProperty('name', 'John');
    });

    it('should throw if user not found', async () => {
      repository.findOneBy.mockResolvedValue(undefined as any);

      await expect(service.findUserById('nonexistent')).rejects.toThrow(
        HttpException,
      );
    });
  });
  // #endregion

  // #region findInactiveUsers
  describe('findInactiveUsers', () => {
    it('should return inactive users', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            id: '1',
            name: 'John',
            email: 'john@mail.com',
            role: 'user',
            lastLogin: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]),
      };
      repository.createQueryBuilder.mockReturnValue(qb as any);

      const result = await service.findInactiveUsers();

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(qb.where).toHaveBeenCalled();
      expect(qb.orWhere).toHaveBeenCalled();
      expect(qb.orderBy).toHaveBeenCalled();
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty('name', 'John');
    });
  });
  // #endregion

  // #region updateUser
  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      const userId = 'some-uuid';
      const existingUser = {
        id: userId,
        name: 'Old Name',
        email: 'old@mail.com',
        password: 'oldHashedPassword',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const dto: UpdateUsersDto = {
        name: 'New Name',
        email: 'new@mail.com',
        password: 'newpassword',
        role: UserRole.ADMIN,
        isActive: false,
      };

      repository.findOneBy.mockResolvedValue(existingUser as any);
      repository.findOne.mockResolvedValue(undefined as any);
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(
          async (password: string, saltOrRounds: number) => 'hashedPassword',
        );
      jest.spyOn(repository, 'merge').mockImplementation(() => {
        return Object.assign(existingUser, {
          name: dto.name,
          password: 'newHashedPassword',
          role: dto.role,
          isActive: dto.isActive,
          updatedAt: new Date(),
        });
      });
      repository.save.mockResolvedValue(existingUser as any);

      const result = await service.updateUser(userId, dto);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(repository.merge).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();

      expect(result).toHaveProperty('name', dto.name);
      expect(result).toHaveProperty('role', dto.role);
      expect(result).toHaveProperty('isActive', dto.isActive);
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should throw if user not found', async () => {
      repository.findOneBy.mockResolvedValue(undefined as any);
      await expect(service.updateUser('1', {} as any)).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw if email already exists on another user', async () => {
      const userId = '1';
      const dto = {
        email: 'existing@mail.com',
        password: '123456',
        name: 'x',
        role: UserRole.USER,
        isActive: true,
      };
      const existingUser = { id: userId, email: 'old@mail.com' } as UserEntity;
      const emailInUseUser = {
        id: '2',
        email: 'existing@mail.com',
      } as UserEntity;

      repository.findOneBy.mockResolvedValue(existingUser);
      repository.findOne.mockResolvedValue(emailInUseUser);

      await expect(service.updateUser(userId, dto)).rejects.toThrow(
        HttpException,
      );
    });
  });
  // #endregion

  // #region delete
  describe('delete', () => {
    it('should delete a user successfully', async () => {
      const userId = '1';
      const user = { id: userId } as UserEntity;
      repository.findOneBy.mockResolvedValue(user);
      repository.remove.mockResolvedValue(user);

      const result = await service.delete(userId);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(repository.remove).toHaveBeenCalledWith(user);
      expect(result).toEqual({ message: 'Usuário deletado com sucesso' });
    });

    it('should throw if user to delete not found', async () => {
      repository.findOneBy.mockResolvedValue(undefined as any);
      await expect(service.delete('1')).rejects.toThrow(HttpException);
    });
  });
  // #endregion
});

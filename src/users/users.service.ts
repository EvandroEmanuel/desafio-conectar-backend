import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUsersDto } from './dto/create-users.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/db/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UpdateUsersDto } from './dto/update-users.dto';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly utilsService: UtilsService,
  ) {}
  async createUser(dto: CreateUsersDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const existEmail = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existEmail) {
      throw new HttpException(`email already exist`, HttpStatus.BAD_REQUEST);
    }

    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
      createdAt: new Date(),
    });
    await this.userRepository.save(user);

    return {
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: new Date(user.createdAt).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour12: false,
      }),
    };
  }

  async findByUserEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findAll(query: any) {
    const queryBuilder = await this.utilsService.applyGlobalFilters<UserEntity>(
      query,
      this.userRepository,
      'user',
      ['name', 'email'] as (keyof UserEntity)[],
    );

    const [data, count] = await queryBuilder.getManyAndCount();

    const result = data.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: new Date(user.createdAt).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour12: false,
      }),
      updatedAt: user.updatedAt
        ? new Date(user.updatedAt).toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour12: false,
          })
        : null,
    }));

    return { data: result, count };
  }

  async findUserById(id: string) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new HttpException(
        `Usuário com id ${id} não encontrado`,
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: new Date(user.createdAt).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour12: false,
      }),
      updatedAt: user.updatedAt
        ? new Date(user.updatedAt).toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour12: false,
          })
        : null,
    };
  }

  async findInactiveUsers() {
    const date = new Date();
    date.setDate(date.getDate() - 30);

    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.lastLogin IS NULL')
      .orWhere('user.lastLogin < :limitDate', { limitDate: date.toISOString() })
      .orderBy('user.lastLogin', 'ASC')
      .getMany();

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin
        ? new Date(user.lastLogin).toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour12: false,
          })
        : null,
      createdAt: new Date(user.createdAt).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour12: false,
      }),
      updatedAt: user.updatedAt
        ? new Date(user.updatedAt).toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour12: false,
          })
        : null,
    }));
  }

  async updateUser(userId: string, dto: UpdateUsersDto) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new HttpException(
        `Usuário com id ${userId} não encontrado`,
        HttpStatus.NOT_FOUND,
      );
    }
    const existingEmail = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingEmail && existingEmail.id !== userId) {
      throw new HttpException(`email already exist`, HttpStatus.BAD_REQUEST);
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    this.userRepository.merge(user, {
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
      isActive: dto.isActive,
      updatedAt: new Date(),
    });

    await this.userRepository.save(user);
    return {
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: new Date(user.createdAt).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour12: false,
      }),
      updatedAt: user.updatedAt
        ? new Date(user.updatedAt).toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour12: false,
          })
        : null,
    };
  }

  async delete(userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new HttpException(
        `Usuário com id ${userId} não encontrado`,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.userRepository.remove(user);
    return { message: 'Usuário deletado com sucesso' };
  }
}

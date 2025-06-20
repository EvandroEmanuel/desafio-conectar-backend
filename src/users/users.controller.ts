import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUsersDto } from './dto/create-users.dto';
import { Public } from 'src/auth/auth.decorator';
import { UpdateUsersDto } from './dto/update-users.dto';
import { Roles } from 'src/auth/roles.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserEntity } from 'src/db/entities/user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  @UsePipes(new ValidationPipe({ forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Criação de um novo usuário' })
  @ApiBody({
    type: CreateUsersDto,
    examples: {
      admin: {
        value: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          password: 'john123',
          role: 'admin',
        },
      },
      user: {
        value: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          password: 'john123',
          role: 'user',
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: UserEntity,
    example: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      createdAt: 'dd/MM/yyyy hh:mm:ss',
    },
  })
  async create(@Body() dto: CreateUsersDto) {
    return this.usersService.createUser(dto);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'O admin pode buscar todos os usuários' })
  @ApiResponse({
    type: UserEntity,
    isArray: true,
    example: [
      {
        id: 'uuid',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'admin',
        isActive: 'true | false',
        createdAt: 'dd/MM/yyyy hh:mm:ss',
        updatedAt: 'dd/MM/yyyy hh:mm:ss | null',
      },
    ],
  })
  @ApiQuery({
    name: 'query',
    description: 'Filtros globais.',
    examples: {
      value: {
        search: '?search=name | email / ?search=John | john.doe@example.com',
        role: '?role=admin | user',
        isActive: '&isActive=true | false',
        startDate: '?startDate=2023-01-01',
        finishDate: '&finishDate=2023-12-31',
      },
    },
  })
  async findAll(@Query() query: any) {
    try {
      return await this.usersService.findAll(query);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('me')
  @ApiOperation({ summary: 'Busca o usuário logado' })
  @ApiResponse({
    type: UserEntity,
    example: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'admin | user',
      isActive: 'true | false',
      createdAt: 'dd/MM/yyyy hh:mm:ss',
      updatedAt: 'dd/MM/yyyy hh:mm:ss | null',
    },
  })
  async findUserById(@Req() req) {
    return await this.usersService.findUserById(req.user.sub);
  }

  @Get('inativos')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Busca todos os usuários inativos' })
  @ApiResponse({
    type: UserEntity,
    isArray: true,
    example: [
      {
        id: 'uuid',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'admin',
        lastLogin: 'dd/MM/yyyy hh:mm:ss | null',
        isActive: 'true | false',
        createdAt: 'dd/MM/yyyy hh:mm:ss',
        updatedAt: 'dd/MM/yyyy hh:mm:ss | null',
      },
    ],
  })
  async findInactiveUsers() {
    return this.usersService.findInactiveUsers();
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualiza o usuário logado' })
  @ApiBody({
    type: UpdateUsersDto,
    examples: {
      admin: {
        value: {
          name: 'John Castle',
          email: 'john.castle@example.com',
          password: 'john123',
          role: 'admin | user',
          isActive: 'true | false',
        },
      },
      user: {
        value: {
          name: 'John Castle',
          email: 'john.castle@example.com',
          password: 'john123',
          role: 'user | admin',
          isActive: 'true | false',
        },
      },
    },
  })
  @ApiResponse({
    type: UserEntity,
    example: {
      name: 'John Castle',
      email: 'john.castle@example.com',
      role: 'admin | user',
      isActive: 'true | false',
      createdAt: 'dd/MM/yyyy hh:mm:ss',
      updatedAt: 'dd/MM/yyyy hh:mm:ss | null',
    },
  })
  async updateUser(@Req() req, @Body() dto: UpdateUsersDto) {
    return await this.usersService.updateUser(req.user.sub, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'O usuário admin atualiza um usuário pelo id' })
  @ApiBody({
    type: UpdateUsersDto,
    examples: {
      admin: {
        value: {
          name: 'John Castle',
          email: 'john.castle@example.com',
          password: 'john123',
          role: 'admin | user',
          isActive: 'true | false',
        },
      },
      user: {
        value: {
          name: 'John Castle',
          email: 'john.castle@example.com',
          password: 'john123',
          role: 'user | admin',
          isActive: 'true | false',
        },
      },
    },
  })
  @ApiResponse({
    type: UserEntity,
    example: {
      name: 'John Castle',
      email: 'john.castle@example.com',
      role: 'admin | user',
      isActive: 'true | false',
      createdAt: 'dd/MM/yyyy hh:mm:ss',
      updatedAt: 'dd/MM/yyyy hh:mm:ss | null',
    },
  })
  async update(@Param('id') id: string, @Body() dto: UpdateUsersDto) {
    return await this.usersService.updateUser(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'O usuário admin deleta um usuário pelo id' })
  @ApiResponse({
    example: {
      message: 'Usuário deletado com sucesso',
    },
  })
  async delete(@Param('id') id: string) {
    return await this.usersService.delete(id);
  }
}

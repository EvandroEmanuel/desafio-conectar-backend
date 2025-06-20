import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    DbModule,
    AuthModule,
    UtilsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

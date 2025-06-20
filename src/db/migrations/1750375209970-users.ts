import { MigrationInterface, QueryRunner } from 'typeorm';

export class Users1750375209970 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(
      `CREATE TYPE "user_role_enum" AS ENUM ('user', 'admin');`,
    );

    await queryRunner.query(`
            CREATE TABLE "user" (
                    id uuid NOT NULL default uuid_generate_v4(),
                    name varchar(256),
                    password varchar(256) NOT NULL,
                    email varchar(256) UNIQUE NOT NULL,
                    role "user_role_enum" DEFAULT 'user',
                    "lastLogin" TIMESTAMP,
                    "createdAt" TIMESTAMP NOT NULL default now(),
                    "updatedAt" TIMESTAMP,
                    "isActive" boolean DEFAULT true,
                    CONSTRAINT user_pk_id PRIMARY KEY (id)
                );
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';

interface FilterQuery {
  search?: string;
  isActive?: string;
  startDate?: string;
  finishDate?: string;
  page?: string;
  limit?: string;
  role?: string;
  [key: string]: any;
}

@Injectable()
export class UtilsService {
  private readonly logger = new Logger(UtilsService.name);

  async applyGlobalFilters<T extends ObjectLiteral>(
    query: FilterQuery,
    repository: Repository<T>,
    alias: string,
    searchColumns: (keyof T)[],
    relations: string[] = [],
    enumColumns: (keyof T)[] = ['status' as keyof T], // personalizável
  ): Promise<SelectQueryBuilder<T>> {
    const {
      search = '',
      isActive,
      startDate,
      finishDate,
      page,
      limit,
      role,
      ...otherFilters
    } = query;

    const queryBuilder = repository.createQueryBuilder(alias);

    relations.forEach((relation) => {
      queryBuilder.leftJoinAndSelect(`${alias}.${relation}`, relation);
    });

    if (search.trim()) {
      const searchConditions = searchColumns
        .map((column) => {
          if (enumColumns.includes(column)) {
            return `${alias}.${String(column)}::text ILIKE :searchValue`;
          }
          return `${alias}.${String(column)} ILIKE :searchValue`;
        })
        .join(' OR ');

      queryBuilder.andWhere(`(${searchConditions})`, {
        searchValue: `%${search}%`,
      });
    }

    if (isActive === 'true' || isActive === 'false') {
      queryBuilder.andWhere(`${alias}.isActive = :isActive`, {
        isActive: isActive === 'true',
      });
    }

    if (role) {
      queryBuilder.andWhere(`${alias}.role = :role`, { role });
    }

    if (!isNaN(Date.parse(startDate ?? ''))) {
      queryBuilder.andWhere(`${alias}.createdAt >= :startDate`, {
        startDate,
      });
    }

    if (!isNaN(Date.parse(finishDate ?? ''))) {
      queryBuilder.andWhere(`${alias}.createdAt <= :finishDate`, {
        finishDate,
      });
    }

    Object.entries(otherFilters).forEach(([key, value]) => {
      if (
        ![
          'search',
          'isActive',
          'startDate',
          'finishDate',
          'page',
          'limit',
          'role',
        ].includes(key)
      ) {
        queryBuilder.andWhere(`${alias}.${key} = :${key}`, { [key]: value });
      }
    });

    const pageNumber = parseInt(page || '1', 10);
    const limitNumber = parseInt(limit || '20', 10);

    if (!isNaN(pageNumber) && !isNaN(limitNumber)) {
      queryBuilder.skip((pageNumber - 1) * limitNumber).take(limitNumber);
    }

    return queryBuilder;
  }
}

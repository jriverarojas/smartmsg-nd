import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import { Reflector } from '@nestjs/core';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const transaction = this.reflector.get<boolean>('transaction', context.getHandler());

    if (!transaction) {
      return next.handle();
    }

    const queryRunner = this.dataSource.createQueryRunner();
    queryRunner.connect();
    queryRunner.startTransaction();

    const request = context.switchToHttp().getRequest();
    request.queryRunner = queryRunner;

    return next.handle().pipe(
      tap(async () => {
        await queryRunner.commitTransaction();
      }),
      catchError(async (err) => {
        await queryRunner.rollbackTransaction();
        throw err;
      }),
      tap(() => {
        queryRunner.release();
      })
    );
  }
}


import { SetMetadata } from '@nestjs/common';

export const Transaction = () => SetMetadata('transaction', true);

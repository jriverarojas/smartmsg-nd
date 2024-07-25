import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Queue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('json')
  payload: any;

  @Column({ default: 'PENDING' })
  status: string;

  @Column()
  redisId: string;

  @Column({ default: '' })
  errorReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

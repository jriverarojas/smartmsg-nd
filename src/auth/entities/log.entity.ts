import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  method: string;

  @Column()
  url: string;

  @Column('json')
  body: Record<string, any>;

  @Column()
  status: number;

  @Column()
  duration: number;

  @CreateDateColumn()
  createdAt: Date;
}

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Function } from './function.entity';
import { Thread } from './thread.entity';

@Entity()
export class FunctionCall {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Function, func => func.functionCalls)
  function: Function;

  @ManyToOne(() => Thread, thread => thread.functionCalls)
  thread: Thread;

  @Column('text')
  params: string;

  @Column('text')
  response: string;
}

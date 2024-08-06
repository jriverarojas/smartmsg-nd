import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Assistant } from './assistant.entity';
import { FunctionCall } from './functioncall.entity';

@Entity()
export class Function {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column('text')
  params: string;

  @Column('text')
  headers: string;

  @Column()
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';

  @Column()
  responseType: 'xml' | 'json';

  @Column({ default: false })
  sendBodyParams: boolean;

  @Column('text')
  templateSource: string;

  @ManyToOne(() => Assistant, assistant => assistant.functions)
  assistant: Assistant;

  @OneToMany(() => FunctionCall, functionCall => functionCall.thread)
  functionCalls: FunctionCall[];

  @Column()
  assistantId: number;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Assistant } from './assistant.entity';
import { Thread } from './thread.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @Column()
  dateCreated: Date;

  @Column({ nullable: true })
  runId?: string;

  @Column()
  status: string; // 'processing' | 'done'

  @Column()
  queueId: string;

  @Column()
  type: string; // 'incoming' | 'outgoing'

  @ManyToOne(() => Assistant, assistant => assistant.messages)
  assistant: Assistant;

  @ManyToOne(() => Thread, thread => thread.messages)
  thread: Thread;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
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
  @JoinColumn({ name: 'assistantId' })
  assistant: Assistant;

  @ManyToOne(() => Thread, thread => thread.messages)
  @JoinColumn({ name: 'threadId' })
  thread: Thread;

  @Column({ nullable: true })
  assistantId?: number;

  @Column()
  threadId: number;

  @Column({ nullable: true })
  refId?: string;
}

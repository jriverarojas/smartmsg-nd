import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinColumn } from 'typeorm';
import { Channel } from './channel.entity';
import { Category } from './category.entity';
import { Message } from './message.entity';
import { Assistant } from './assistant.entity';
import { Instance } from './instance.entity';

@Entity()
export class Thread {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  externalId?: string;

  @Column()
  externalInstance: string;//this is the phone number or id that generated the thread

  @Column()
  expirationDate: Date;

  @ManyToOne(() => Channel, channel => channel.threads)
  channel: Channel;

  @ManyToOne(() => Category, category => category.threads, { nullable: true })
  @JoinColumn({ name: 'categoryId' }) 
  category: Category;

  @OneToMany(() => Message, message => message.thread)
  messages: Message[];

  @ManyToMany(() => Assistant, assistant => assistant.threads)
  assistants: Assistant[];

  @ManyToOne(() => Instance, instance => instance.threads)
  @JoinColumn({ name: 'instanceId' }) // This ensures the join column is named 'instanceId'
  instance: Instance;

  @Column()
  instanceId: number; // This should match the join column name

  @Column({ nullable: true })
  categoryId?: number;
}

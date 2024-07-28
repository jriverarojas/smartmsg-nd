import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Category } from './category.entity';
import { Thread } from './thread.entity';
import { Message } from './message.entity';
import { InstanceAssistant } from './instance-assistant.entity';

@Entity()
export class Assistant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  active: boolean;

  @Column()
  working: string; // 'Y' or 'N'

  @OneToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToMany(() => Category, category => category.assistants)
  @JoinTable()
  categories: Category[];

  @ManyToMany(() => Thread, thread => thread.assistants)
  @JoinTable()
  threads: Thread[];

  @OneToMany(() => Message, message => message.assistant)
  messages: Message[];

  @OneToMany(() => InstanceAssistant, instanceAssistant => instanceAssistant.assistant)
  instanceAssistants: InstanceAssistant[];

  @Column()
  userId: number;
}

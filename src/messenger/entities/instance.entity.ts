import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Channel } from './channel.entity';
import { Thread } from './thread.entity';
import { InstanceAssistant } from './instance-assistant.entity';

@Entity()
export class Instance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  number: string;

  @Column()
  externalId: string;

  @ManyToOne(() => Channel, channel => channel.instances)
  @JoinColumn({ name: 'channelId' })
  channel: Channel;

  @OneToMany(() => Thread, thread => thread.instance)
  threads: Thread[];

  @OneToMany(() => InstanceAssistant, instanceAssistant => instanceAssistant.instance)
  instanceAssistants: InstanceAssistant[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  channelId: number;
}

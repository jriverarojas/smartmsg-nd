import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Channel } from './channel.entity';
import { Thread } from './thread.entity';

@Entity()
export class Instance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  number: string;

  @Column()
  externalId: string;

  @ManyToOne(() => Channel, channel => channel.instances)
  channel: Channel;

  @OneToMany(() => Thread, thread => thread.instance)
  threads: Thread[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

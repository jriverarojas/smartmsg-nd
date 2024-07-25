import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Thread } from './thread.entity';
import { Instance } from './instance.entity';

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()//service to call on new message
  service: string;

  @Column()//config for channel actions
  config: string;

  @Column()//number of minutes to expire conversation
  expiresIn: number;

  @Column()
  name: string;

  @OneToMany(() => Thread, thread => thread.channel)
  threads: Thread[];

  @OneToMany(() => Instance, instance => instance.channel)
  instances: Instance[];
}

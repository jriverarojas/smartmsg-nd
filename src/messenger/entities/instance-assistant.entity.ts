import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Instance } from './instance.entity';
import { Assistant } from './assistant.entity';

@Entity()
export class InstanceAssistant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  isDefault: boolean;

  @ManyToOne(() => Instance, instance => instance.instanceAssistants)
  @JoinColumn({ name: 'instanceId' })
  instance: Instance;

  @Column()
  instanceId: number;

  @ManyToOne(() => Assistant, assistant => assistant.instanceAssistants)
  @JoinColumn({ name: 'assistantId' })
  assistant: Assistant;

  @Column()
  assistantId: number;
}

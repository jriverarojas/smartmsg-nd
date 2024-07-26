import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinColumn } from 'typeorm';
import { Thread } from './thread.entity';
import { Assistant } from './assistant.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  name: string;

  @ManyToOne(() => Category, category => category.subcategories)
  @JoinColumn({ name: 'parentId' })
  parent: Category;

  @OneToMany(() => Category, category => category.parent)
  subcategories: Category[];

  @ManyToMany(() => Assistant, assistant => assistant.categories)
  assistants: Assistant[];

  @OneToMany(() => Thread, thread => thread.category)
  threads: Thread[];

  @Column()
  parentId: number;
}

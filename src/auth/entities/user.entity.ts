import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate, ManyToMany, JoinTable } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from './role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, select: false })
  password: string;

  @Column({ default: false })
  isApiUser: boolean;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true, select: false })
  apiKey: string;

  @Column({ nullable: true, select: false })
  apiKeyLastDigits: string;

  @Column({ nullable: true, select: false })
  apiKeyExpiration: Date;

  @ManyToMany(() => Role, role => role.users)
  @JoinTable()
  roles: Role[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  async handleApiKey() {
    if (this.apiKey) {
      this.apiKeyLastDigits = this.apiKey.slice(-5);
      this.apiKey = await bcrypt.hash(this.apiKey, 10);
    }
  }
}

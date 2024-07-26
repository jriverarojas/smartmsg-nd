import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    let user = this.usersRepository.create(createUserDto);
    if (user.isApiUser) {
      user = await this.usersRepository.save(user)
      const payload = { email: user.email, sub: user.id };
      const accessToken = this.jwtService.sign(payload, { expiresIn: '10y' });
      const currentDate = new Date();
      
      // Add 10 years to the current date
      currentDate.setFullYear(currentDate.getFullYear() + 10);
      user.apiKeyExpiration = currentDate;
      user.apiKey = accessToken;
      user = await this.usersRepository.save(user)
      await this.redisService.storeUser(user);
      return { accessToken, ...user };
    } else {
      return this.usersRepository.save(user);
    }
    
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id }, relations: ['roles'], cache: true });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email }, select: ['id', 'email', 'password', 'name'], relations: ['roles'] });
    if (!user) {
      throw new NotFoundException(`User with ID ${email} not found`);
    }
    return user;
  }

  async updatePassword(id: number, updatePasswordDto: UpdatePasswordDto): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id }, select: ['id', 'password'] });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const isPasswordValid = await bcrypt.compare(updatePasswordDto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }
    user.password = updatePasswordDto.newPassword;
    await this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}

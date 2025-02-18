import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import axios from 'axios';
import Handlebars from 'handlebars';
import { Function } from '../entities/function.entity';
import { FunctionCall } from '../entities/functioncall.entity';
import { EncryptionService } from 'src/auth/service/encryption.service';
import { Thread } from '../entities/thread.entity';
import { AutomaticService } from './automatic.service';
import { CreateFunctionDto } from '../dto/create-function.dto';
import { UpdateFunctionDto } from '../dto/update-function.dto';
@Injectable()
export class FunctionService {
  constructor(
    private readonly automaticService: AutomaticService,
    private readonly dataSource: DataSource,
    private readonly encryptionService: EncryptionService,
    @InjectRepository(Function)
    private functionRepository: Repository<Function>,
  ) {}

  async create(createFunctionDto: CreateFunctionDto): Promise<Function> {
    const { url, headers, ...rest } = createFunctionDto;
    const encryptedUrl = this.encryptionService.encrypt(url);
    const encryptedHeaders = this.encryptionService.encrypt(headers);

    const func = this.functionRepository.create({
      ...rest,
      url: encryptedUrl,
      headers: encryptedHeaders,
    });

    return this.functionRepository.save(func);
  }

  async findAll(): Promise<Function[]> {
    return this.functionRepository.find();
  }

  async findOne(id: number): Promise<Function> {
    const f = await this.functionRepository.findOneBy({ id });
    f.url = this.encryptionService.decrypt(f.url);
    f.headers = this.encryptionService.decrypt(f.headers);
    if (!f) {
      throw new NotFoundException(`Function with ID ${id} not found`);
    }
    return f;
  }

  async update(id: number, updateFunctionDto: UpdateFunctionDto): Promise<Function> {
    const { url, headers, ...rest } = updateFunctionDto;
    const encryptedUrl = this.encryptionService.encrypt(url);
    const encryptedHeaders = this.encryptionService.encrypt(headers);

    await this.functionRepository.update(id, {
      ...rest,
      url: encryptedUrl,
      headers: encryptedHeaders,
    });

    return this.functionRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.functionRepository.delete(id);
  }

  async execute(functionEntities: Function, queueItem: any) {

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { functions, threadId, instance, channel, assistantConfig, origin, firedBy, runId } = queueItem;

    try {
      let index = 0;
      for (const f of functions) {
        const func = functionEntities[index];
        const functionParams = f.params;

        let decryptedHeaders = func.headers ? this.encryptionService.decrypt(func.headers) : '{}';
        const headers = JSON.parse(decryptedHeaders);
        const params = JSON.parse(functionParams);

        const url = this.replaceUrlParams(this.encryptionService.decrypt(func.url), params);


        const response = await axios({
            method: func.method,
            url,
            headers,
            ...(func.sendBodyParams ? { data: params } : {}),
        });

        const template = Handlebars.compile(func.templateSource);
        const result = template(response.data);

        functions[index].output = result;

        const thread = await queryRunner.manager.findOne(Thread, {
            where: {
              externalId: threadId,
            },
        });

        const functionCall = queryRunner.manager.create(FunctionCall, {
            function: func,
            threadId,
            params: functionParams,
            response: result,
          });
    
        await queryRunner.manager.save(functionCall);
      }   
      this.automaticService.handleRequireFunction(firedBy, assistantConfig, threadId, instance, channel, origin, functions, runId);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  private replaceUrlParams(url: string, params: object): string {
    const template = Handlebars.compile(url);
    return template(params);
  }
}

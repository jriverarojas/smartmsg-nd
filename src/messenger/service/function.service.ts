import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import axios from 'axios';
import Handlebars from 'handlebars';
import { Function } from '../entities/function.entity';
import { FunctionCall } from '../entities/functioncall.entity';
import { EncryptionService } from 'src/auth/service/encryption.service';
import { Thread } from '../entities/thread.entity';
import { AutomaticService } from './automatic.service';

@Injectable()
export class FunctionService {
  constructor(
    private readonly automaticService: AutomaticService,
    private readonly dataSource: DataSource,
    private readonly encryptionService: EncryptionService,
  ) {}

  async execute(functionEntities: Function, queueItem: any) {

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { functions, threadId, instance, channel, assistantConfig, origin, firedBy, runId } = queueItem;

    let finalResponse = '';

    try {
      let index = 0;
      for (const f of functions) {
        const func = functionEntities[index];
        const functionParams = f.params;

        let decryptedHeaders = this.encryptionService.decrypt(func.headers);
        const headers = JSON.parse(decryptedHeaders);
        const params = JSON.parse(functionParams);

        const url = this.replaceUrlParams(func.url, params);

        const response = await axios({
            method: func.method,
            url,
            headers,
            data: func.sendBodyParams ? params : undefined,
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

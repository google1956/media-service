import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    appController = moduleRef.get<AppController>(AppController);
  });

  describe('GET "/"', () => {
    it('should contain "CDN upload media service!"', () => {
      expect(appController.getHello()).toContain('CDN upload media service');
    });
  });
  describe('GET "/health"', () => {
    it(`should return "Healthy"`, () => {
      return request(app.getHttpServer()).get('/health').expect(200).expect({
        status: HttpStatus.OK,
        data: 'Healthy',
      });
    });
  });
});

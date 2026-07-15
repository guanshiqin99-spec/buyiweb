const { NestFactory } = require('@nestjs/core');

let expressApp;

async function bootstrap() {
  if (expressApp) return expressApp;
  const { AppModule } = require('../dist/app.module');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.init();
  expressApp = app.getHttpAdapter().getInstance();
  return expressApp;
}

module.exports = async (req, res) => {
  const app = await bootstrap();
  app(req, res);
};
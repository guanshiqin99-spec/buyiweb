import 'dotenv/config';
import { DataSource } from 'typeorm';
import { appConfig } from './config/app.config';
import { buildTypeOrmOptions } from './config/database.config';

const config = appConfig();

export default new DataSource(buildTypeOrmOptions(config));

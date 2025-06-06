import { registerAs } from '@nestjs/config';
import entities from 'src/typeorm';

export default registerAs('database', () => {
    return ({
        type: process.env.DB_TYPE || 'postresql',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: entities,
        synchronize: true
    })
});

export { default as DatabaseConfig } from './database.config';
import { Pool } from 'pg';

const pool = new Pool({
    user: 'nitish',
    host: 'localhost',
    database: 'db_test',
    password: '123',
    port: 5432,
});

export default pool;

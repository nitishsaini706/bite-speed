import { Pool } from 'pg';

const pool = new Pool({
    user: 'nitish',
    host: 'dpg-cn91g28l5elc73909mh0-a',
    database: 'bitespeed_fj5u',
    password: 'nl9GNah3DHtBCl5BAdXjLaSxcbnPp25q',
    port: 5432,
});

export default pool;

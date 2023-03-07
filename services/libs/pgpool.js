const Pool = require('pg-pool');

const config = {
    user:                    process.env.DB_USER,
    password:                process.env.DB_PASSWORD,
    host:                    process.env.DB_HOST,
    port:                    process.env.DB_PORT,
    database:                process.env.DB_NAME,
};

const pool = new Pool(config);
console.log('DB connect')

pool.on('error', (error, client) => {
    console.log('error', 'pg-pool error event', '', 'ERROR', {}, {}, {}, error);
    console.error(error);
    process.exit(-1);
});

pool.on('connect', client => {
    console.log('New client');
});

pool.on('remove', client => {
    console.log('Client pool removed');
});

module.exports = {
    pool: pool,
};

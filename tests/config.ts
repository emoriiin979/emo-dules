export default {
    mysqlConnInfo: {
        host: process.env.MYSQL_HOST ?? '',
        port: parseInt(process.env.MYSQL_PORT ?? '3306'),
        user: process.env.MYSQL_USER ?? '',
        password: process.env.MYSQL_PASSWORD ?? '',
        database: process.env.MYSQL_DATABASE ?? '',
    },
    pgsqlConnInfo: {
        host: process.env.POSTGRES_HOST ?? '',
        port: parseInt(process.env.POSTGRES_PORT ?? '5432'),
        user: process.env.POSTGRES_USER ?? '',
        password: process.env.POSTGRES_PASSWORD ?? '',
        database: process.env.POSTGRES_DB ?? '',
    },
};

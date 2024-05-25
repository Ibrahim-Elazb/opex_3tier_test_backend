import * as serverlessMysql from "serverless-mysql";
import * as mysql2 from "mysql2";

const slsMysql2 = serverlessMysql({
    // @ts-ignore
    library: mysql2,
    config: {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        database: process.env.MYSQL_DATABASE,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
    },
});

export default async function executeQuery({ query, values }) {
    try {
        const results = await slsMysql2.query(query, values);
        return results;
    } catch (error) {
        console.error('Database query error:', error);  // Log the error for debugging

        const customError = {
            message: 'Failed to execute query',
            detail: error.message,
            code: error.code, // Including error code if available
        };

        throw customError;
    } finally {
        await slsMysql2.end();
    }
}

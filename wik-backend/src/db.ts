// other parameters are from ENV vars
import * as fs from "fs";
import {Pool} from 'pg';
import {getLogger} from "./log/logger";
const logger = getLogger(module.filename);

export class DB {
    private static db: DB;
    private _pool: Pool;

    private constructor() {
        const poolConf = {
            ssl: {
                rejectUnauthorized: true,
                ca: fs.readFileSync(__dirname + '/../rds-ca-2019-root.pem').toString(),
            }
        };
        this._pool = new Pool(poolConf);
        this._pool.on('error', (err) => {
            logger.error('Unexpected error on idle client', err);
            process.exit(-1)
        })
    }

    public static getDb(): DB {
        if (!this.db) {
            this.db = new DB();
        }
        return this.db;
    }

    public get pool(): Pool {
        return this._pool;
    }
}
import {DB} from "../db";
import {Level, User} from "../db/DatabaseMapping";

export async function getLevels(): Promise<Array<Level>> {
    return (await DB.getDb().pool.query('SELECT * FROM "Level" ORDER BY "index"')).rows;
}

export async function getUser(userId: string): Promise<User> {
    return (await DB.getDb().pool.query('SELECT * FROM "User" WHERE "uid"=$1', [userId])).rows[0];
}
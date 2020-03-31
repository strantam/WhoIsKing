import {DB} from "../db";
import {Level, User} from "../db/DatabaseMapping";

export async function getLevels(): Promise<Array<Level>> {
    return (await DB.getDb().pool.query('SELECT * FROM "Level" ORDER BY "index"')).rows;
}

export async function getUser(userId: string): Promise<User> {
    return (await DB.getDb().pool.query('SELECT * FROM "User" WHERE "uid"=$1', [userId])).rows[0];
}


export async function getUserPoints(userId: string): Promise<number> {
    const oneMonthBefore = new Date();
    oneMonthBefore.setMonth(oneMonthBefore.getMonth() - 1);
    oneMonthBefore.setHours(0, 0, 0, 0);
    const point = (await DB.getDb().pool.query('SELECT SUM("points") as points FROM "Guess" WHERE "userId"= $1 AND "createdAt" > $2 GROUP BY "userId"', [userId, oneMonthBefore])).rows[0];
    return point ? point.points : 0;
}
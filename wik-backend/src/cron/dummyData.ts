import {User} from "../db/DatabaseMapping";
import {DB} from "../db";
import {getLogger} from "../log/logger";
import * as uuid from 'uuid';

const logger = getLogger(module.filename);

const questions: Array<{ question: string, answers: Array<string> }> = [
    {
        question: 'How much do you sleep a day?',
        answers: ['Less than 4 hours', '4-6 hours', '6-8 hours', '8-10 hours', 'More than 10 hours']
    },
    {
        question: 'Which animal is your favourite?',
        answers: ['Cat', 'Dog', 'Fish', 'Bird', 'Reptile', 'Other']
    },
    {
        question: 'What is your favourite furniture store?',
        answers: ['Ikea', 'Jysk', 'Kika', 'Other']
    },
    {
        question: 'What cousine is the best?',
        answers: ['Indian', 'Italian', 'Thai', 'Chinese', 'Hungarian', 'Other']
    },
];

async function addDummyData(): Promise<void> {
    logger.info("Dummy data update started");
    try {
        const users: Array<User> = (await DB.getDb().pool.query('SELECT * FROM "User"')).rows;
        for (const user of users) {
            const randomQuestion = questions[Math.round(Math.random() * (questions.length - 1))];
            const dbClient = await DB.getDb().pool.connect();
            try {
                await dbClient.query('BEGIN');
                const questionId = (await dbClient.query('INSERT INTO "Question" ("uid", "question", "userId", "votes", "createdAt") VALUES ($1, $2, $3, $4, $5) RETURNING uid', [uuid.v4(), randomQuestion.question, user.uid, Math.round(Math.random() * 40), new Date()])).rows[0].uid;
                const answerIds = [];
                for (const answer of randomQuestion.answers) {
                    answerIds.push((await dbClient.query('INSERT INTO "Answer" ("uid", "questionId", "answer", "votes", "createdAt") VALUES ($1, $2, $3, $4, $5) RETURNING uid', [uuid.v4(), questionId, answer, Math.round(Math.random() * 10), new Date()])).rows[0].uid);
                }
                await dbClient.query('INSERT INTO "Solution" ("uid", "cityId", "answerId", "userId", "createdAt", "questionId") VALUES ($1, $2, $3, $4, $5, $6)', [uuid.v4(), user.cityId, answerIds[Math.round(Math.random() * (answerIds.length - 1))], user.uid, new Date(), questionId]);
                await dbClient.query(
                    'INSERT INTO "Guess" ("uid", "cityId", "answerId", "userId", "createdAt", "questionId", "points") VALUES ($1, $2, $3, $4, $5, $6, $7)',
                    [uuid.v4(), user.cityId, answerIds[Math.round(Math.random() * (answerIds.length - 1))], user.uid, new Date(), questionId, Math.round(Math.random() * 10)]
                );
                await dbClient.query('COMMIT');
                logger.info(`Dummy data update finished for user ${user.uid}`);

            } catch (err) {
                logger.error("Error on adding dummy data" + JSON.stringify(err.message));
                await dbClient.query('ROLLBACK');
            } finally {
                dbClient.release();
            }
        }
        logger.info("Dummy data update finished");
    } catch (err) {
        logger.error("Dummy data update error" + err.message + " " + JSON.stringify(err));
    }
}

addDummyData();

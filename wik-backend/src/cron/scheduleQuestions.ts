import {DB} from "../db";
import {Question} from "../db/DatabaseMapping";
import {getLogger} from "../log/logger";

const logger = getLogger(module.filename);

function getStartDate(startHour: number): Date {
    const tomorrowStart = new Date();
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(startHour, 0, 0, 0);
    return tomorrowStart;
}

function getEndDate(endHour: number): Date {
    const tomorrowEnd = new Date();
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
    tomorrowEnd.setHours(endHour, 0, 0, 0);
    return tomorrowEnd;
}

function splitDate(startDate: Date, endDate: Date, parts: number, currentPart: number): Date {
    const wholeInterval = endDate.getTime() - startDate.getTime();
    const onePart = wholeInterval / (parts + 1);
    return new Date(startDate.getTime() + onePart * currentPart);
}

function createOpenMidCloseTimes(openDate: Date): { open: Date, mid: Date, close: Date } {
    const open = new Date(openDate);
    const mid = new Date(openDate);
    mid.setMinutes(mid.getMinutes() + 1);
    const close = new Date(openDate);
    close.setMinutes(close.getMinutes() + 2);
    return {
        open: open,
        mid: mid,
        close: close
    }
}

async function scheduleQuestion(questionsPerDay: number, startHour: number, endHour: number): Promise<void> {
    logger.info("Question scheduling started");
    try {
        const questions: Array<Question> = (await DB.getDb().pool.query('SELECT * FROM "Question" WHERE "openTime" IS NULL ORDER BY "votes" DESC')).rows;
        const parts = Math.min(questions.length, questionsPerDay);
        const startDate = getStartDate(startHour);
        const endDate = getEndDate(endHour);
        for (let i = 0; i < parts; i++) {
            const times = createOpenMidCloseTimes(splitDate(startDate, endDate, parts, i + 1));
            await DB.getDb().pool.query('UPDATE "Question" SET "openTime" = $1, "closeTime" = $2, "changeToGuessTime"=$3 WHERE "uid"= $4', [times.open, times.close, times.mid, questions[i].uid]);
            logger.debug("Question scheduled. uid: " + questions[i].uid + " start: " + times.open);
        }
        logger.info("Question scheduling finished");
    } catch (err) {
        logger.error("Question schedule error" + err.message + " " + JSON.stringify(err));

    }
}

scheduleQuestion(parseInt(process.env.QUESTIONS_PER_DAY), parseInt(process.env.QUESTION_START_HOUR), parseInt(process.env.QUESTION_FINISH_HOUR));
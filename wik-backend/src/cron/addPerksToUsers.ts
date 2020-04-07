import {Level, User} from "../db/DatabaseMapping";
import {DB} from "../db";
import {getLevels, getUserPoints} from "../util/dbQuery";
import {getLogger} from "../log/logger";

const logger = getLogger(module.filename);

async function calculatePerks(): Promise<void> {
    logger.info("User perks calculation started");
    try {
        const users: Array<User> = (await DB.getDb().pool.query('SELECT * FROM "User"')).rows;
        const levels: Array<Level> = await getLevels();
        for (const user of users) {
            const userPoints = await getUserPoints(user.uid);
            let userLevelIndex;
            if (userPoints >= levels[levels.length - 1].points) {
                userLevelIndex = levels.length - 1;
            } else {
                userLevelIndex = levels.findIndex(level => level.points > userPoints) - 1;
            }
            await DB.getDb().pool.query(
                'UPDATE "User" SET "votes" = "votes" + $1, "questions" = "questions" + $2 WHERE "uid"= $3',
                [levels[userLevelIndex].plusVotes, levels[userLevelIndex].plusQuestions, user.uid]
            );
            logger.debug("User perks added to user " + user.uid + " points/votes/questions: " + userPoints + "/" + levels[userLevelIndex].plusVotes + "/" + levels[userLevelIndex].plusQuestions)
        }
        logger.info("User perks calculation finished");
    } catch (err) {
        logger.error("User perks calculation error" + err.message + " " + JSON.stringify(err));
    }
}

calculatePerks();
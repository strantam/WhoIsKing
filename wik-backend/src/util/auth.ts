import * as admin from "firebase-admin";
import {getLogger} from "../log/logger";
import UserRecord = admin.auth.UserRecord;

const logger = getLogger(module.filename);

export async function getUserFromToken(tokenWithBearer: string): Promise<UserRecord> {
    const token = tokenWithBearer.substr(7);
    const decodedToken = await admin.auth().verifyIdToken(token);
    return await admin.auth().getUser(decodedToken.uid);
}
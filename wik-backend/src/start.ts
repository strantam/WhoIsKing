import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as admin from 'firebase-admin';
import * as expressWinston from 'express-winston';
import * as swaggerUI from 'swagger-ui-express';
import * as yamlConv from 'yamljs';
import * as uuid from 'uuid';


import {getUserFromToken} from "./util/auth";
import {AsyncHookHandler} from "./log/AsyncHookHandler";
import {getLogger} from "./log/logger";
import {OpenApiValidator} from "express-openapi-validator/dist";
import {DB} from "./db";
import {ErrorCode, ErrorObject, HttpStatus} from "./error/ErrorObject";
import {authRouter} from "./openApi/routes/auth/authRoutes";
import {nonAuthRouter} from "./openApi/routes/nonAuth/nonAuthRoutes";

const hookHandler = AsyncHookHandler.getAsyncHookHandler();

const logger = getLogger(module.filename);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express');

const cert = JSON.parse(process.env.FIREBASE_CREDENTIALS);
admin.initializeApp({
    credential: admin.credential.cert(cert)
});


class Server {
    public app;
    private port = process.env.PORT || 9090;

    public static bootstrap(): Server {
        return new Server();
    }

    constructor() {
        // Create expressjs application
        this.app = express();

        if (!process.env.ENVIRONMENT || process.env.ENVIRONMENT === "LOCAL") {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const cors = require('cors');
            this.app.use(cors());
        }
        this.app.use(express.static(__dirname + '/../../wik-frontend/dist/hu/'));
        // Depending on your own needs, this can be extended
        this.app.use(bodyParser.json({limit: '50mb'}));
        this.app.use(bodyParser.raw({limit: '50mb'}));
        this.app.use(bodyParser.text({limit: '50mb'}));
        this.app.use(bodyParser.urlencoded({
            limit: '50mb',
            extended: true
        }));

        this.app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(yamlConv.load(__dirname + '/../openapi.yaml')));
        this.app.use((req, res ,next) => {
            hookHandler.init();
            next();
        });
        this.app.use('/api/auth', async (req, res, next) => {
            try {
                let firebaseUser;
                try {
                    firebaseUser = await getUserFromToken(req.headers.authorization as string);
                } catch (err) {
                    logger.error("Auth token not valid" + JSON.stringify(err));
                    throw new ErrorObject(ErrorCode.FIREBASE_AUTH_ERROR, "Auth token not valid", HttpStatus.UNAUTHENTICATED);
                }
                logger.info(firebaseUser.uid);
                let user = await DB.getDb().pool.query('SELECT * FROM "User" WHERE "fireBaseId"=$1', [firebaseUser.uid]);
                if (user.rows && user.rows.length === 0) {
                    user = await DB.getDb().pool.query('INSERT INTO "User" ("uid", "fireBaseId", "createdAt", "highestLevel", "nickName", "votes", "questions") VALUES ($1, $2, $3, $4, $5, 0, 0) RETURNING *', [uuid.v4(), firebaseUser.uid, new Date(), 1, "user" + new Date().toISOString()]);
                }
                if (!user || !user.rows || user.rows.length !== 1) {
                    throw new ErrorObject(ErrorCode.DB_QUERY_ERROR, "DB user id cannot be resolved", HttpStatus.INTERNAL_SERVER);
                }
                res.locals.userId = user.rows[0].uid;
                next();
            } catch (err) {
                logger.error("Error on authentication " + JSON.stringify(err));
                next(err);
            }
        });

        this.app.use(expressWinston.logger({
            winstonInstance: logger,
            dynamicMeta: ((req, res) => {
                return {
                    userId: res.locals.userId
                }
            }),
            headerBlacklist: ["authorization"]
        }));

        this.init();

        process.on('uncaughtException', (error) => {
            logger.error('uncaught exception', error);
        });
    }

    async init(): Promise<void> {
        await new OpenApiValidator({
            apiSpec: __dirname + '/../openapi.yaml',
            validateRequests: true, // (default)
            validateResponses: true,
            unknownFormats: [
                "base64",
                "json"
            ]
        }).install(this.app);

        this.app.use('/api/auth', authRouter);
        this.app.use('/api/noAuth', nonAuthRouter);

        this.app.get('*', (req, res) => {
            res.sendFile(path.resolve(__dirname + '/../../wik-frontend/dist/hu/index.html'));
        });
        this.app.use((err, req, res, next) => {
            logger.error("Error processing request: " + JSON.stringify(err.message) + JSON.stringify(err));

            if (res.headersSent) {
                return next(err)
            }
            if (err.ownErrorObject) {
                const errorTyped: ErrorObject = err;
                res.status(errorTyped.httpStatus);
                res.json(err);
            } else {
                res.json(err);
            }
        });
        // Start the server on the provided port
        this.app.listen(this.port, () => logger.info(`http is started ${this.port}`));

        // Catch errors
        this.app.on('error', (error) => {
            logger.error('ERROR', error);
        });
    }
}

const server = Server.bootstrap();
export default server.app;

import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as admin from 'firebase-admin';
import * as expressWinston from 'express-winston';
import * as swaggerUI from 'swagger-ui-express';
import * as yamlConv from 'yamljs';
import addRoutes from './routes/index.routes';
import {AsyncHookHandler} from "./log/AsyncHookHandler";
import {getLogger} from "./log/logger";
import {OpenApiValidator} from "express-openapi-validator/dist";
import {ApiErrorObject, ErrorCode} from "./error/ApiErrorObject";
import {GeneralErrorModel} from "./openApi/model/generalErrorModel";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express');

const hookHandler = AsyncHookHandler.getAsyncHookHandler();

const logger = getLogger(module.filename);


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
        this.app.use((req, res, next) => {
            if (process.env.ENVIRONMENT && !(process.env.ENVIRONMENT === "LOCAL") && req.headers['x-forwarded-proto'] !== 'https') {
                return res.redirect('https://' + req.headers.host + req.url);
            } else
                return next();
        });
        this.app.use('/api/v1/docs', swaggerUI.serve, swaggerUI.setup(yamlConv.load(__dirname + '/../openapi.yaml')));

        this.app.use(express.static(__dirname + '/../../wik-frontend/dist/en/'));
        // Depending on your own needs, this can be extended
        this.app.use(bodyParser.json({limit: '50mb'}));
        this.app.use(bodyParser.raw({limit: '50mb'}));
        this.app.use(bodyParser.text({limit: '50mb'}));
        this.app.use(bodyParser.urlencoded({
            limit: '50mb',
            extended: true
        }));


        this.app.use((req, res, next) => {
            hookHandler.init();
            next();
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

        addRoutes(this.app);

        this.app.get('*', (req, res) => {
            res.sendFile(path.resolve(__dirname + '/../../wik-frontend/dist/en/index.html'));
        });
        this.app.use((err, req, res, next) => {
            logger.error('Error processing request: ', err);

            if (res.headersSent) {
                return next(err);
            }
            let errorTyped: ApiErrorObject;
            if (err.ownErrorObject) {
                errorTyped = err;
            } else {
                let errorCode: ErrorCode;
                switch (err.status) {
                    case 400:
                        errorCode = ErrorCode.BAD_REQUEST;
                        break;
                    case 401:
                        errorCode = ErrorCode.UNAUTHENTICATED;
                        break;
                    default:
                        errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
                }
                errorTyped = new ApiErrorObject(
                    errorCode,
                    err.errors || 'Internal server error'
                );
            }
            const apiError: GeneralErrorModel = {
                errorCode: errorTyped.errorCode,
                message: errorTyped.message,
            };
            res.status(errorTyped.httpStatus).json(apiError);
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

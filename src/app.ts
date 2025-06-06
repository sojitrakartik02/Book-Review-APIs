import 'reflect-metadata'
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import compression from 'compression'
import cookieParser from 'cookie-parser'
import { NODE_ENV, PORT, LOG_FORMAT, FRONTEND_URL, BACKEND_SERVER_URL } from './config/index'
import { connectDatabase } from './database/index';
import cors from 'cors'
import helmet from 'helmet';
import { Routes } from './interface/routes.interface';
import { ErrorMiddleware } from './middlewares/error.middleware';
import { logger as Logger, stream } from './utils/logger';
import envCheckMiddleware from './middlewares/envValidator';
import morgan from 'morgan'
import i18next from './utils/i18n';
import i18nextMiddleware from 'i18next-http-middleware';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './utils/swagger';



export class App {
    public app: express.Application;
    public env: string;
    public port: string | number;
    public httpServer: any;
    public server: any;
    public http: any;

    constructor(routes: Routes[]) {
        this.app = express();
        this.env = NODE_ENV || 'development';
        this.port = PORT || 3020;
        this.app.set('port', this.port);
        this.httpServer = createServer(this.app);

        this.http = require('http').Server(this.app)

        this.initializeMiddlewares();
        this.databaseConnection()
        this.initializeRoutes(routes)
        this.initializeErrorHandling()
    }

    private initializeMiddlewares() {
        this.app.use(i18nextMiddleware.handle(i18next));

        this.app.use(morgan(LOG_FORMAT, { stream }));
        this.app.use(envCheckMiddleware)
        this.app.use(cors({ origin: ["*", FRONTEND_URL, BACKEND_SERVER_URL], credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE'] }))
        this.app.use(compression())
        this.app.use(cookieParser())
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(helmet())
        this.app.use(express.urlencoded({ extended: true }));
        this.app.disable('x-powered-by');
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    }


    public async listen() {
        try {
            await new Promise((resolve, reject) => {
                this.httpServer.listen(this.port, () => {
                    console.log(`==========================================`);
                    console.log(`========== ENV: ${this.env} ==============`);

                    Logger.info(`=== 🚀 App listening on the port ${this.port} ===`);
                    console.log(`==========================================`);
                    resolve(true);
                }).on('error', (error) => {
                    Logger.error(`Port is already in use`, error);
                    reject(error);
                });
            });
        } catch (error) {
            Logger.error('Error while starting the app:', error);
            process.exit(1);
        }
    }



    public databaseConnection() {
        connectDatabase()
    }
    private initializeRoutes(routes: Routes[]) {
        routes.forEach(route => {

            this.app.use('/api/v1', route.router);

        });

        this.app.get('/ping', (req, res) => {
            return res.status(200).send(req.t('welcome'));
        });
        this.app.use('*', this.routHandler);

    }



    public initializeErrorHandling() {
        this.app.use(ErrorMiddleware)

    }


    private routHandler(req: Request, res: Response) {
        res.status(404).json({ message: req.t('route not found') });

    }




}
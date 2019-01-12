import express = require('express');
import bodyParser = require('body-parser');
import http = require('http');
import { ServerAuth } from './BlogBackend';

import * as BlogController from './controllers/BlogController';

export default class Selfserver {

    public port: number = 3000;

    private app: express.Application;
    private server: http.Server | undefined;
    
    constructor(_port: number = 3000, _staticDirectory: string = "public/"){
        this.port = _port;

        this.app = express();
        this.app.set('views', _staticDirectory);
        this.app.use(bodyParser.urlencoded({extended: true}));
        this.app.use(bodyParser.json());
        this.app.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
            next();
        });
        this.app.use(express.static(_staticDirectory, {index: '/index.html'}));

        ServerAuth.tokenStore.loadStore('user_tokens/store.json');
    }

    public useRouter(endpoint: string, route: express.Router) {
        if (route !== undefined && endpoint.trim())
        {
            this.app.use(endpoint, route);
        }
    }

    public startServer(){
        this.server = this.app.listen(this.port, () => {
            console.log(`Listening on ${this.port}`);
        });
    }

    public stopServer() {
        this.server!.close();
    }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const BlogBackend_1 = require("./BlogBackend");
class Selfserver {
    constructor(_port = 3000, _staticDirectory = "public/") {
        this.port = 3000;
        this.port = _port;
        this.app = express();
        this.app.set('views', _staticDirectory);
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
        this.app.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
            next();
        });
        this.app.use(express.static(_staticDirectory, { index: '/index.html' }));
        BlogBackend_1.ServerAuth.tokenStore.loadStore('user_tokens/store.json');
    }
    useRouter(endpoint, route) {
        if (route !== undefined && endpoint.trim()) {
            this.app.use(endpoint, route);
        }
    }
    startServer() {
        this.server = this.app.listen(this.port, () => {
            console.log(`Listening on ${this.port}`);
        });
    }
    stopServer() {
        this.server.close();
    }
}
exports.default = Selfserver;
//# sourceMappingURL=Selfserve.js.map
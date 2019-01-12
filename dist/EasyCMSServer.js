"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
class Server {
    constructor(_port = 3000, _staticDirectory = "new/public/") {
        this.port = 3000;
        this.port = _port;
        this.app = express();
        this.app.set('views', _staticDirectory);
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
        this.app.use(express.static(_staticDirectory, { index: '/index.html' }));
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
exports.default = Server;
//# sourceMappingURL=EasyCMSServer.js.map
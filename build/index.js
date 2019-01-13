"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Selfserve_1 = __importDefault(require("./Selfserve"));
const BlogController = __importStar(require("./controllers/BlogController"));
const express_1 = require("express");
const TestingController = __importStar(require("./controllers/testing"));
const BlogBackend_Mongo_1 = require("./BlogBackend_Mongo");
const cms = new Selfserve_1.default();
/**
 * Modify this array to add more routes/endpoints to Express.
 */
const routes = [
    BlogController,
    TestingController
];
routes.forEach((route) => {
    console.log("adding route: " + route.Endpoint);
    if (route.Endpoint.trim()) {
        if (typeof (route.Controller) == typeof (express_1.Router))
            cms.useRouter(route.Endpoint, route.Controller);
    }
});
try {
    BlogBackend_Mongo_1.ServerAuth.initServerAuth();
    cms.startServer();
}
catch (exc) {
    console.log('a critical error has happened');
    console.log(exc);
    console.log('fix it axiom@ignoresolutions.xyz');
}
//# sourceMappingURL=index.js.map
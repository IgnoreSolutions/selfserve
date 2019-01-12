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
const cms = new Selfserve_1.default();
/**
 * Modify this array to add more routes/endpoints to Express.
 */
const routes = [
    BlogController.BlogController
];
routes.forEach((route) => {
    if (typeof (BlogController.BlogController) == typeof (express_1.Router))
        cms.useRouter(BlogController.Endpoint, route);
});
try {
    cms.startServer();
}
catch (exc) {
    console.log('a critical error has happened');
    console.log(exc);
    console.log('fix it axiom@ignoresolutions.xyz');
}
//# sourceMappingURL=index.js.map
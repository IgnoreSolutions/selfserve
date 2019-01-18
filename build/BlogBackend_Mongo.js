"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*import { callbackify } from "util";*/
const TokenStore_1 = __importDefault(require("./TokenStore"));
const MongoRequests_1 = require("./MongoRequests");
const querystring_1 = require("querystring");
var fx = require("money");
var UserPower;
(function (UserPower) {
    UserPower[UserPower["Admin"] = 1] = "Admin";
    UserPower[UserPower["User"] = 2] = "User";
})(UserPower = exports.UserPower || (exports.UserPower = {}));
class User {
    constructor(_id, _username, _password, _signup_date, _email, _power) {
        this.password = undefined;
        this.id = -1;
        this.username = _username;
        this.password = _password;
        this.signup_date = _signup_date;
        this.email = _email;
        this.power = _power;
    }
}
exports.User = User;
class ServerAuth {
    static initServerAuth() {
        this.mongoBackend = new MongoRequests_1.MongoDBInstance("testdb", "users");
    }
    static getUserInformation(res, callback, username, id) {
        let verb = 'username';
        let value = username;
        if (id !== undefined) {
            verb = '_id';
            value = querystring_1.stringify(id);
        }
        this.mongoBackend.query(verb, value, (err, res) => {
            if (err)
                throw err;
            callback(res);
        });
    }
    static getUserById(id, callback) {
        this.mongoBackend.query("_id", querystring_1.stringify(id), (err, result) => {
            callback(result);
        });
    }
    static getUserByName(username, callback) {
        this.mongoBackend.query("username", username, (err, result) => {
            callback(result);
        });
    }
    static doLogin(res, username, password, callback) {
        console.log("do it");
        this.mongoBackend.query("username", username, (err, result) => {
            if (result) {
                if (result.username === username && result.password === password) {
                    const newToken = ServerAuth.tokenStore.generateToken(username);
                    res.set('Authorization', newToken.token);
                    res.status(200).send(result);
                    callback(MongoRequests_1.MongoDBStatus.OK);
                }
                else
                    res.status(400).send('User not found/credential mismatch. L2');
            }
            else {
                res.status(400).send('User not found/credential mismatch');
                callback(MongoRequests_1.MongoDBStatus.Error, "User not found/credential mismatch. " + result);
            }
        });
    }
    static registerUser(res, username, password, email) {
        if (username.trim() && password.trim() && email.trim()) {
            let newUser = new User(-1, username, password, new Date(Date.now()), email, 3);
            this.mongoBackend.insertRecord(newUser, (err, result) => {
                if (err)
                    throw err;
                res.status(200).send(JSON.stringify(newUser));
            });
        }
    }
    static verifyUserPower(username, token, callback) {
        if (username.trim() && token.trim()) {
            if (ServerAuth.tokenStore.verifyToken(username, token)) {
                this.mongoBackend.query("username", username, (err, res) => {
                    if (err)
                        throw err;
                    if (res)
                        callback(username, res.power);
                    else
                        callback(username, -1);
                });
            }
        }
    }
    static getRandomInt(maxValue) {
        return Math.floor(Math.random() * Math.floor(maxValue));
    }
    static makePost(res, userPosting, _token, post) {
        if (ServerAuth.tokenStore.verifyToken(userPosting.username, _token)) {
            this.mongoBackend.changeCollection("blog");
            let toBeInserted = post;
            toBeInserted.date = new Date(Date.now());
            toBeInserted.author = userPosting.username;
            this.mongoBackend.insertRecord(post, (err, result) => {
                if (err)
                    throw err;
                res.status(200).send(JSON.stringify(toBeInserted));
            });
            this.mongoBackend.changeCollection("users");
        }
    }
    static editPost(res, userEditing, _token, updatedPost) {
        if (ServerAuth.tokenStore.verifyToken(userEditing.username, _token)) {
            this.mongoBackend.changeCollection("blog");
            this.mongoBackend.query("_id", querystring_1.stringify(updatedPost.id), (err, res) => {
                if (err)
                    throw err;
                if (res) {
                    let postToBeEdited = JSON.parse(res);
                    this.mongoBackend.updateRecord(postToBeEdited, updatedPost, (err, res) => {
                        if (err)
                            throw err;
                        res.status(200).send(JSON.stringify(updatedPost));
                    });
                }
            });
            this.mongoBackend.changeCollection("users");
        }
    }
    static deletePost(res, userDeleting, _token, postID) {
        if (ServerAuth.tokenStore.verifyToken(userDeleting.username, _token)) {
            this.mongoBackend.changeCollection("blog");
            this.mongoBackend.delete("_id", querystring_1.stringify(postID));
            res.status(200).send("OK"); // TODO
            this.mongoBackend.changeCollection("users");
        }
    }
    static getLatestPosts(limit = 20, res) {
        this.mongoBackend.changeCollection("blog");
        const postsToReturn = this.mongoBackend.returnN(limit);
        console.log(postsToReturn); // TODO:
        console.log("TODO: this");
        res.status(200).send(JSON.stringify(postsToReturn));
        this.mongoBackend.changeCollection("users");
    }
    static getPostByID(postID, res) {
        try {
            this.mongoBackend.changeCollection("blog");
            this.mongoBackend.query("_id", querystring_1.stringify(postID), (err, res) => {
                if (err)
                    throw err;
                let blogPost = JSON.parse(res);
                if (blogPost) {
                    this.mongoBackend.changeCollection("users");
                    this.mongoBackend.query("username", querystring_1.stringify(blogPost.author), (err, res2) => {
                        if (err)
                            throw err;
                        let userPosting = JSON.parse(res2);
                        if (userPosting) {
                            blogPost.author = userPosting;
                            res.status(200).send(JSON.stringify(blogPost));
                        }
                        else
                            res.status(400).send('User posted not found');
                    });
                }
            });
        }
        catch (exc) {
            console.log('getPostByID', exc);
        }
        this.mongoBackend.changeCollection("users");
    }
    static getPostsByUsername(res, user, limit) {
        this.mongoBackend.changeCollection("blog");
        const returnedPosts = this.mongoBackend.returnNByKey(limit, "author", user.username);
        if (returnedPosts != undefined) {
            res.status(200).send(JSON.stringify(returnedPosts));
        }
        else {
            res.status(400).send("Nope");
        }
        this.mongoBackend.changeCollection("users");
        // TODO: error checking/handling
    }
}
// TODO: fix this accessor
ServerAuth.tokenStore = new TokenStore_1.default();
exports.ServerAuth = ServerAuth;
//# sourceMappingURL=BlogBackend_Mongo.js.map
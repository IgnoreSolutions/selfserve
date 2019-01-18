import express = require("express");
/*import { callbackify } from "util";*/
import TokenStore from "./TokenStore";
import { MongoDBInstance, MongoDBStatus } from "./MongoRequests";
import { isBuffer } from "util";
import { stringify } from "querystring";
import { json } from "body-parser";

var fx = require("money");

export enum UserPower {
    Admin = 1,
    User = 2,
}

export class User implements IUser {
    public id: number;
    public username: string;
    public signup_date: Date;
    public email: string;
    public power: UserPower;
    public password: string | undefined = undefined;

    constructor(_id: number, _username: string, _password: string | undefined, _signup_date: Date, _email: string, _power: UserPower) {
        this.id = -1;
        this.username = _username; this.password = _password!; this.signup_date = _signup_date; this.email = _email; this.power = _power;
    }
}

export interface IUser {
    id: number;
    username: string;
    password: string | undefined;
    signup_date: Date;
    email: string;
    power: UserPower;
}

export interface IBlogPost {
    title: string;
    message: string;
    author: IUser | string;
    date: Date;

    /**
     * Post ID
     */
    id: number;
}


export abstract class ServerAuth {

    // TODO: fix this accessor
    public static tokenStore: TokenStore = new TokenStore();
    
    private static mongoBackend: MongoDBInstance;

    public static initServerAuth()
    {
        this.mongoBackend = new MongoDBInstance("testdb", "users");
    }

    public static getUserInformation(res: express.Response, callback: (result: IUser) => void, username?: string, id?: number) {
        let verb = 'username';
        let value = username!;
        if (id !== undefined) {
            verb = '_id';
            value = stringify(id!);
        }
        
        this.mongoBackend.query(verb, value, (err: any, res: any) => {
            if(err) throw err;
            callback(res);
        });
    }

    public static getUserById(id: number, callback: (result: IUser) => void) {
        this.mongoBackend.query("_id", stringify(id), (err: any, result: any) =>{
            callback(result);
        });
    }

    public static getUserByName(username: string, callback: (result: IUser) => void) {
        this.mongoBackend.query("username", username, (err: any, result: any) => {
            callback(result);
        });
    }

    public static doLogin(res: express.Response, username: string, password: string, callback: (status: MongoDBStatus, err?: any) => void) {
        console.log("do it");
        this.mongoBackend.query("username", username, (err: any, result: any) => {
            if (result) {
                if (result.username === username && result.password === password) {
                    const newToken = ServerAuth.tokenStore.generateToken(username);
                    res.set('Authorization', newToken.token);
                    res.status(200).send(result);
                    callback(MongoDBStatus.OK);
                }
                else
                    res.status(400).send('User not found/credential mismatch. L2');
            }
            else {
                res.status(400).send('User not found/credential mismatch');
                callback(MongoDBStatus.Error, "User not found/credential mismatch. " + result);
            }
        });
    }

    public static registerUser(res: express.Response, username: string, password: string, email: string) {
        if (username.trim() && password.trim() && email.trim())
        {
            let newUser: IUser = new User(-1, username, password, new Date(Date.now()), email, 3);
            this.mongoBackend.insertRecord(newUser, (err: any, result: any) => {
                if(err) throw err;
                res.status(200).send(JSON.stringify(newUser));
            });
        }
    }

    public static verifyUserPower(username: string, token: string, callback: (username: string, power: number) => void) {
        if (username.trim() && token.trim()) {
            if (ServerAuth.tokenStore.verifyToken(username, token)) {
                this.mongoBackend.query("username", username, (err: any, res: any) =>{
                    if(err) throw err;
                    if(res) callback(username, res.power);
                    else    callback(username, -1);
                });
            }
        }
    }

    private static getRandomInt(maxValue: number) {
        return Math.floor(Math.random() * Math.floor(maxValue));
    }

    public static makePost(res: express.Response, userPosting: IUser, _token: string, post: IBlogPost): void {
        if(ServerAuth.tokenStore.verifyToken(userPosting.username, _token))
        {
            this.mongoBackend.changeCollection("blog");
            let toBeInserted: IBlogPost = post;
            toBeInserted.date = new Date(Date.now());
            toBeInserted.author = userPosting.username;
            this.mongoBackend.insertRecord(post, (err: any, result: any) => {
                if(err) throw err;
                res.status(200).send(JSON.stringify(toBeInserted));
            });
            this.mongoBackend.changeCollection("users");
        }
    }

    public static editPost(res: express.Response, userEditing: IUser, _token: string, updatedPost: IBlogPost) {
        if(ServerAuth.tokenStore.verifyToken(userEditing.username, _token))
        {
            this.mongoBackend.changeCollection("blog");
            this.mongoBackend.query("_id", stringify(updatedPost.id), (err: any, res: any) => {
                if(err) throw err;
                if(res) {
                    let postToBeEdited: IBlogPost = JSON.parse(res);
                    this.mongoBackend.updateRecord(postToBeEdited, updatedPost, (err: any, res: any) => {
                        if(err) throw err;
                        res.status(200).send(JSON.stringify(updatedPost));
                    });
                }
            });
            this.mongoBackend.changeCollection("users");
        }
    }

    public static deletePost(res: express.Response, userDeleting: IUser, _token: string, postID: number) {
        if(ServerAuth.tokenStore.verifyToken(userDeleting.username, _token))
        {
            this.mongoBackend.changeCollection("blog");
            this.mongoBackend.delete("_id", stringify(postID));
            res.status(200).send("OK"); // TODO
            this.mongoBackend.changeCollection("users");
        }
    }

    public static getLatestPosts(limit: number = 20, res: express.Response) {
        this.mongoBackend.changeCollection("blog");
        const postsToReturn = this.mongoBackend.returnN(limit);
        console.log(postsToReturn); // TODO:
        console.log("TODO: this");
        res.status(200).send(JSON.stringify(postsToReturn));
        this.mongoBackend.changeCollection("users");
    }

    public static getPostByID(postID: number, res: express.Response) {
        try
        {
            this.mongoBackend.changeCollection("blog");
            this.mongoBackend.query("_id", stringify(postID), (err: any, res: any) => {
                if(err) throw err;
                let blogPost: IBlogPost = JSON.parse(res);
                if(blogPost) {
                    this.mongoBackend.changeCollection("users");
                    this.mongoBackend.query("username", stringify(blogPost.author), (err: any, res2: any) => {
                        if(err) throw err;
                        let userPosting: IUser = JSON.parse(res2);
                        if(userPosting)
                        {
                            blogPost.author = userPosting;
                            res.status(200).send(JSON.stringify(blogPost));
                        }
                        else
                            res.status(400).send('User posted not found');
                    });
                }
            });
        }
        catch(exc) {console.log('getPostByID', exc);}

        this.mongoBackend.changeCollection("users");
    }

    public static getPostsByUsername(res: express.Response, user: IUser, limit: number) {
        this.mongoBackend.changeCollection("blog");
        const returnedPosts = this.mongoBackend.returnNByKey(limit, "author", user.username);
        if(returnedPosts != undefined)
        {
            res.status(200).send(JSON.stringify(returnedPosts));
        }
        else
        {
            res.status(400).send("Nope");
        }
        this.mongoBackend.changeCollection("users");
        // TODO: error checking/handling
    }
}

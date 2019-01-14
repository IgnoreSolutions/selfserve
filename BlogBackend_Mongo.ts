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
        if (id !== undefined) {
            verb = 'id';
        }
        let result: IUser | undefined = undefined;
        if(username === undefined) //by ID
            result = this.mongoBackend.query("_id", stringify(id));
        else //by username
            result = this.mongoBackend.query("username", stringify(username));
        callback(result!);
    }

    public static getUserById(id: number, callback: (result: IUser) => void) {
        let result: IUser = this.mongoBackend.query("_id", stringify(id));
        callback(result);
    }

    public static getUserByName(username: string, callback: (result: IUser) => void) {
        let result: IUser = this.mongoBackend.query("username", username);
        callback(result);
    }

    public static doLogin(res: express.Response, username: string, password: string, callback: (status: MongoDBStatus, err?: any) => void) {
        let result: IUser = this.mongoBackend.query("username", username);

        if(result)
        {
            if(result.username === username && result.password === password)
            {
                const newToken = ServerAuth.tokenStore.generateToken(username);
                res.set('Authorization', newToken.token);
                res.status(200).send(`Logged in as ${username} successfully.`);
                callback(MongoDBStatus.OK);
            }
        }
        else
        {
            res.status(400).send('User not found/credential mismatch');
            callback(MongoDBStatus.Error, "User not found/credential mismatch. " + result);
        }
    }

    public static registerUser(res: express.Response, username: string, password: string, email: string) {
        if (username.trim() && password.trim() && email.trim())
        {
            let newUser: IUser = new User(-1, username, password, new Date(Date.now()), email, 3);
            this.mongoBackend.insertRecord(newUser);
            // TODO: status/callbacks
        }
    }

    public static verifyUserPower(username: string, token: string, callback: (username: string, power: number) => void) {
        if (username.trim() && token.trim()) {
            if (ServerAuth.tokenStore.verifyToken(username, token)) {
                let result: IUser = this.mongoBackend.query("username", username);
                if(result)
                {
                    if(result.username === username)
                        callback(username, result.power);
                }
                else
                {
                    callback(username, -1);
                }
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
            this.mongoBackend.insertRecord(post);
            this.mongoBackend.changeCollection("users");
        }
    }

    public static editPost(res: express.Response, userEditing: IUser, _token: string, updatedPost: IBlogPost) {
        if(ServerAuth.tokenStore.verifyToken(userEditing.username, _token))
        {
            this.mongoBackend.changeCollection("blog");
            let postToBeEdited: IBlogPost = this.mongoBackend.query("_id", stringify(updatedPost.id));
            if(postToBeEdited)
            {
                this.mongoBackend.updateRecord(postToBeEdited, updatedPost);
                res.status(200).send(JSON.stringify(updatedPost));
            }
            else
                res.status(400).send("Error while editing.");
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
            let blogPost: IBlogPost = this.mongoBackend.query("_id", stringify(postID));
            
            if(blogPost)
            {
                this.mongoBackend.changeCollection("users");
                let userPosting: IUser = this.mongoBackend.query("username", stringify(blogPost.author));
                if(userPosting)
                {
                    blogPost.author = userPosting;
                    res.status(200).send(JSON.stringify(blogPost));
                }
                else
                {
                    res.status(400).send('user who posted not found');
                }
            }
            else
            {
                res.status(400).send('Post not found.');
            }
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

/**
 * The debug controller
 */

import { Router, Request, Response } from 'express';

import { ServerAuth, IUser, User, IBlogPost } from '../BlogBackend_Mongo';
import { MongoDBInstance, MongoDBStatus } from '../MongoRequests'

const router: Router = Router();
const mongo: MongoDBInstance = new MongoDBInstance("testdb", "users");

router.get('/test', (req: Request, res: Response) => {
    res.send('Hello world');
});

router.get('/userlist', (req: Request, res: Response) => {
    var returnValue = mongo.returnAll((value: any) =>
    {
        res.status(200).send(JSON.stringify(value));
    });
})

router.post('/adduser', (req: Request, res: Response) => {
    const _username = req.body.username;
    const _password = req.body.password;
    const _email = req.body.email;

    if(_username.trim() && _password.trim() && _email.trim())
    {
        ServerAuth.registerUser(res, _username, _password, _email);
    }
});

router.post('/removeuser', (req: Request, res: Response) => {
    const _userID = req.body._id;

    if(_userID.trim())
    {
        mongo.delete("_id", _userID);
    }
})

router.post('/edituser', (req: Request, res: Response) => {
    const _newUserObject = req.body.new;
    const _userID = req.body.id;

    if(_userID.trim() && _newUserObject.trim())
    {
        var queryObj = mongo.query("_id", _userID);
        if(queryObj)
        {
            var newUserObj = JSON.parse(_newUserObject);
            mongo.updateRecord(queryObj, newUserObj);
            res.status(200).send("Updated.");
        }
        else
        {
            res.status(400).send("Couldn't update user.");
        }
    }
})

router.get('/user', (req: Request, res: Response) => {
    const _byUsername = req.body.username;
    const _byId = req.body.id;

    let resultingUser: IUser | undefined = undefined;
    if(_byUsername) //by username
        resultingUser = mongo.query("username", _byUsername);
    else
        resultingUser = mongo.query("_id", _byId);

    if(resultingUser)
    {
        res.status(200).send(JSON.stringify(resultingUser));
    }
    else
    {
        res.status(400).send('No user found.');
    }
})

export const Controller: Router = router;
export const Endpoint: string = '/TESTING';
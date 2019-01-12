import { Router, Request, Response } from 'express';
import { ServerAuth, IUser, User, IBlogPost } from '../BlogBackend';
import { SQLStatus, MySQLInstance } from '../SQLRequests';
import { MysqlError } from 'mysql';
import expressWs = require('express-ws');

const router: Router = Router();

router.post('/loginnode', (req: Request, res: Response) => {
    if (req.body.username != null) {
        ServerAuth.doLogin(res, req.body.username, req.body.password, (status, err) =>
        {
            if (err){throw err; }
        });
    }
});

router.post('/tokencheck', (req: Request, res: Response) => {
    if (req.body.username != null && req.body.token != null) {
        const username = req.body.username;
        const token = req.body.token;
        if(ServerAuth.tokenStore.verifyToken(username, token))
        {
            res.status(200).send('OK');
        }
        else
            res.status(401).send('Unauthorized');
    };
});

router.get('/avatar', (req: Request, res: Response) => {
    const _username = req.query.username;
    const fs = require('fs');
    if (fs.existsSync(`./new/public/images/avatars/${_username}.png`))
    {
        res.send(`http://104.248.115.9/images/avatars/${_username}.png`);
    }
    else{ res.send('http://104.248.115.9/images/avatars/default.png'); }
});

router.get('/changeavatar', (req: Request, res: Response) => {
    if (req.body.username.trim() && req.body.token.trim())
    {
        if (ServerAuth.tokenStore.verifyToken(req.body.username, req.body.token))
        {
            const receivedObject = JSON.parse(req.body.avatar);
            const base64Data = receivedObject.image.split(',')[1];
            require('fs').writeFile(`./html/blog/avatars/${req.body.username}.png`, base64Data, 'base64', (err: any) => {
                if (err) { res.status(400).send(err); }
                else
                {
                    res.status(200).send('Success');
                }
            });
        }
        else
            res.status(400).send('Unauthorized.');
    }
    else
        res.status(400).send('Unauthorized.');
});

router.post('/powercheck', (req: Request, res: Response) => {
    if (req.body.username != null && req.body.token != null) {
        const _username: string | undefined = req.body.username;
        const _id: number | undefined = req.body.id;
        const _token = req.body.token;
        //TODO: double check this?
        if (ServerAuth.tokenStore.verifyToken(_username!, _token)) {
            ServerAuth.getUserInformation(res, (result: IUser) => {
                if (result !== undefined)
                {
                    res.set('Power', result.power.toString());
                    res.send('Check power header');
                }
                else
                    res.status(400).send('Error: ' + result);
            }, _username, _id);
        }
        else {
            res.status(400).send("Invalid token.");
        }
    }
    else { res.status(400).send("Bad token or username"); }
});

router.get('/userinfo', (req: Request, res: Response) => {
    let byUsername: string | undefined = req.query.byUsername;
    let byId: number | undefined = req.query.byId;

    byId !== undefined ? byUsername = undefined : byId = undefined;

    ServerAuth.getUserInformation(res, (result: IUser) => {
        if (result !== undefined)
        {
            res.status(200).send(JSON.stringify(result));
        }
        else
            res.status(400).send('Error: ' + JSON.stringify(result));
    }, byUsername, byId);
});
/// Post to this URL with the following parameters
/// username, password, email
router.post('/registernode', (req: Request, res: Response) => {
    const _username = req.body.username;
    const _password = req.body.password;
    const _email = req.body.email;
    if (_username.trim() && _password.trim() && _email.trim()) {
        /*
        const sqlQuery = `INSERT INTO \`users\` (\`id\`,\`username\`,\`password\`,\`email\`,\`signup_date\`,\`power\`) VALUES (NULL, "${_username}", "${_password}", "${_email}", NOW(), 2);`;
        MySQLInstance.query(sqlQuery, (status: SQLStatus, err: MysqlError, result: any) => {
            if (err) {
                res.status(400).send(`Error: ${err}`);
            }
            else {
                res.status(200).send("Registered successfully!");
                console.log(`registered new user: ${_username} (${_email})`);
            }
        });
        */
    }
});
// TODO: remove this for launch.
router.post('/userlist', (req: Request, res: Response) => {
    const _username = req.body.username;
    const _token = req.body.token;
    if (_username.trim() && _token.trim()) {
        if (ServerAuth.tokenStore.verifyToken(_username, _token)) {
            res.status(200).send(':) wip');
            /*
            MySQLInstance.query("SELECT * FROM users", (status: SQLStatus, err: MysqlError, result: any) => {
                let inner = '';
                for (let i = 0; i < result.length; i++) {
                    const cur = result[i];
                    inner += `<li>${cur.id}: ${cur.username} / ${cur.email} / Signup Date: ${cur.signup_date}</li>`;
                }
                res.status(200).send(`<ul>${inner}</ul>`);
            });
            */
        }
        else { res.status(401).send("Not authorized."); }
    }
    else {
        res.status(401).send("Not authorized.");
    }
});
router.get('/userlist', (req: Request, res: Response) => {
    res.send("POST instead!");
});

router.post('/post', (req: Request, res: Response) => {
    const _messageText = req.body.message;
    const _author = req.body.author;
    const _title = req.body.title; 
    const _email = req.body.email;

    const _token = req.body.token;

    if (!ServerAuth.tokenStore.verifyToken(_author, _token)) {
        res.status(401).send('Unauthorised, bad token.');
        return; 
    }

    let userPosting: User | undefined;
    ServerAuth.getUserByName(_author, (result: IUser) => {
        userPosting = new User(result.id, result.username, undefined, result.signup_date, result.email, result.power);
    });

    const post: IBlogPost = {
        title: _title,
        message: encodeURI(_messageText),
        author: userPosting!,
        date: new Date(Date.now()),
        id: 0,
    };

    ServerAuth.makePost(res, userPosting!, _token, post);
});

router.post('/editpost', (req: Request, res: Response) => {
    const msgID: number = req.body.id;
    const _username: string = req.body.author;
    const _newtitle = req.body.title;
    const _token = req.body.token;
    const _newMessage = req.body.message;

    if (msgID > 0) {
        let userEditing: User | undefined;
        ServerAuth.getUserByName(_username, (result: IUser) => {
            userEditing = new User(result.id, result.username, undefined, result.signup_date, result.email, result.power);
        });
        if (!ServerAuth.tokenStore.verifyToken(_username, _token)) {
            res.header('Access-Control-Allow-Headers', 'true');
            res.status(401).send('Unauthorised or bad token.');
            return;
        }
        ServerAuth.verifyUserPower(_username, _token, (username: string, powerLevel: number) => {
            if (powerLevel !== 1 ) { res.status(401).send('Nope.'); return; }

            const updatedPost: IBlogPost = {
                title: _newtitle,
                message: encodeURI(_newMessage),
                author: userEditing!,
                date: new Date(Date.now()),
                id: msgID,
            };

            ServerAuth.editPost(res, userEditing!, _token, updatedPost);
        });
    }
    else
    {
        res.status(400).send('No ID specified.');
    }
});

router.post('/deletepost', (req: Request, res: Response) => {
    const msgID: number = req.body.id;
    const _username: string = req.body.username;
    const _token: string = req.body.token;

    let userDeleting: IUser | undefined;
    ServerAuth.getUserByName(_username, (result: IUser) => {userDeleting = result; });

    if (msgID > 0 && _username.trim() && _token.trim())
    {
        if (!ServerAuth.tokenStore.verifyToken(_username, _token)) {res.status(400).send('Nope'); return; }
        ServerAuth.verifyUserPower(_username, _token, (username: string, power: number) => {
            if(power !== 1) {res.send(401).send('Nope'); return;}
            ServerAuth.deletePost(res, userDeleting!, _token, msgID);
        });
    }
    else
    {
        res.status(400).send('Bad params');
    }
});

router.get('/getpost', (req: Request, res: Response) => {
    const postID: number = req.query.id;
    const byUsername: string = req.query.byUsername;

    const limit: number = req.query.limit;

    if (postID !== undefined && postID > 0)
    {
        ServerAuth.getPostByID(postID, res);
    }

    if (byUsername !== undefined && byUsername.trim())
    {
        let user: IUser | undefined;
        ServerAuth.getUserByName(byUsername, (result: IUser) => {
            user = result;
        });
        ServerAuth.getPostsByUsername(res, user!, limit);
    }

    if (!postID && !byUsername)
    {
        ServerAuth.getLatestPosts(limit, res);
    }

});



export const BlogController: Router = router;
export const Endpoint: string = '/blog';

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BlogBackend_1 = require("../BlogBackend");
const router = express_1.Router();
router.post('/loginnode', (req, res) => {
    if (req.body.username != null) {
        BlogBackend_1.ServerAuth.doLogin(res, req.body.username, req.body.password, (status, err) => {
            if (err) {
                throw err;
            }
        });
    }
});
router.post('/tokencheck', (req, res) => {
    if (req.body.username != null && req.body.token != null) {
        const username = req.body.username;
        const token = req.body.token;
        if (BlogBackend_1.ServerAuth.tokenStore.verifyToken(username, token)) {
            res.status(200).send('OK');
        }
        else
            res.status(401).send('Unauthorized');
    }
    ;
});
router.get('/avatar', (req, res) => {
    const _username = req.query.username;
    const fs = require('fs');
    if (fs.existsSync(`./new/public/images/avatars/${_username}.png`)) {
        res.send(`http://104.248.115.9/images/avatars/${_username}.png`);
    }
    else {
        res.send('http://104.248.115.9/images/avatars/default.png');
    }
});
router.get('/changeavatar', (req, res) => {
    if (req.body.username.trim() && req.body.token.trim()) {
        if (BlogBackend_1.ServerAuth.tokenStore.verifyToken(req.body.username, req.body.token)) {
            const receivedObject = JSON.parse(req.body.avatar);
            const base64Data = receivedObject.image.split(',')[1];
            require('fs').writeFile(`./html/blog/avatars/${req.body.username}.png`, base64Data, 'base64', (err) => {
                if (err) {
                    res.status(400).send(err);
                }
                else {
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
router.post('/powercheck', (req, res) => {
    if (req.body.username != null && req.body.token != null) {
        const _username = req.body.username;
        const _id = req.body.id;
        const _token = req.body.token;
        //TODO: double check this?
        if (BlogBackend_1.ServerAuth.tokenStore.verifyToken(_username, _token)) {
            BlogBackend_1.ServerAuth.getUserInformation(res, (result) => {
                if (result !== undefined) {
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
    else {
        res.status(400).send("Bad token or username");
    }
});
router.get('/userinfo', (req, res) => {
    let byUsername = req.query.byUsername;
    let byId = req.query.byId;
    byId !== undefined ? byUsername = undefined : byId = undefined;
    BlogBackend_1.ServerAuth.getUserInformation(res, (result) => {
        if (result !== undefined) {
            res.status(200).send(JSON.stringify(result));
        }
        else
            res.status(400).send('Error: ' + JSON.stringify(result));
    }, byUsername, byId);
});
/// Post to this URL with the following parameters
/// username, password, email
router.post('/registernode', (req, res) => {
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
router.post('/userlist', (req, res) => {
    const _username = req.body.username;
    const _token = req.body.token;
    if (_username.trim() && _token.trim()) {
        if (BlogBackend_1.ServerAuth.tokenStore.verifyToken(_username, _token)) {
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
        else {
            res.status(401).send("Not authorized.");
        }
    }
    else {
        res.status(401).send("Not authorized.");
    }
});
router.get('/userlist', (req, res) => {
    res.send("POST instead!");
});
router.post('/post', (req, res) => {
    const _messageText = req.body.message;
    const _author = req.body.author;
    const _title = req.body.title;
    const _email = req.body.email;
    const _token = req.body.token;
    if (!BlogBackend_1.ServerAuth.tokenStore.verifyToken(_author, _token)) {
        res.status(401).send('Unauthorised, bad token.');
        return;
    }
    let userPosting;
    BlogBackend_1.ServerAuth.getUserByName(_author, (result) => {
        userPosting = new BlogBackend_1.User(result.id, result.username, undefined, result.signup_date, result.email, result.power);
    });
    const post = {
        title: _title,
        message: encodeURI(_messageText),
        author: userPosting,
        date: new Date(Date.now()),
        id: 0,
    };
    BlogBackend_1.ServerAuth.makePost(res, userPosting, _token, post);
});
router.post('/editpost', (req, res) => {
    const msgID = req.body.id;
    const _username = req.body.author;
    const _newtitle = req.body.title;
    const _token = req.body.token;
    const _newMessage = req.body.message;
    if (msgID > 0) {
        let userEditing;
        BlogBackend_1.ServerAuth.getUserByName(_username, (result) => {
            userEditing = new BlogBackend_1.User(result.id, result.username, undefined, result.signup_date, result.email, result.power);
        });
        if (!BlogBackend_1.ServerAuth.tokenStore.verifyToken(_username, _token)) {
            res.header('Access-Control-Allow-Headers', 'true');
            res.status(401).send('Unauthorised or bad token.');
            return;
        }
        BlogBackend_1.ServerAuth.verifyUserPower(_username, _token, (username, powerLevel) => {
            if (powerLevel !== 1) {
                res.status(401).send('Nope.');
                return;
            }
            const updatedPost = {
                title: _newtitle,
                message: encodeURI(_newMessage),
                author: userEditing,
                date: new Date(Date.now()),
                id: msgID,
            };
            BlogBackend_1.ServerAuth.editPost(res, userEditing, _token, updatedPost);
        });
    }
    else {
        res.status(400).send('No ID specified.');
    }
});
router.post('/deletepost', (req, res) => {
    const msgID = req.body.id;
    const _username = req.body.username;
    const _token = req.body.token;
    let userDeleting;
    BlogBackend_1.ServerAuth.getUserByName(_username, (result) => { userDeleting = result; });
    if (msgID > 0 && _username.trim() && _token.trim()) {
        if (!BlogBackend_1.ServerAuth.tokenStore.verifyToken(_username, _token)) {
            res.status(400).send('Nope');
            return;
        }
        BlogBackend_1.ServerAuth.verifyUserPower(_username, _token, (username, power) => {
            if (power !== 1) {
                res.send(401).send('Nope');
                return;
            }
            BlogBackend_1.ServerAuth.deletePost(res, userDeleting, _token, msgID);
        });
    }
    else {
        res.status(400).send('Bad params');
    }
});
router.get('/getpost', (req, res) => {
    const postID = req.query.id;
    const byUsername = req.query.byUsername;
    const limit = req.query.limit;
    if (postID !== undefined && postID > 0) {
        BlogBackend_1.ServerAuth.getPostByID(postID, res);
    }
    if (byUsername !== undefined && byUsername.trim()) {
        let user;
        BlogBackend_1.ServerAuth.getUserByName(byUsername, (result) => {
            user = result;
        });
        BlogBackend_1.ServerAuth.getPostsByUsername(res, user, limit);
    }
    if (!postID && !byUsername) {
        BlogBackend_1.ServerAuth.getLatestPosts(limit, res);
    }
});
exports.BlogController = router;
exports.Endpoint = '/blog';
//# sourceMappingURL=BlogController.js.map
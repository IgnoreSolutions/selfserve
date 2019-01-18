"use strict";
/**
 * The debug controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BlogBackend_Mongo_1 = require("../BlogBackend_Mongo");
const MongoRequests_1 = require("../MongoRequests");
const router = express_1.Router();
const mongo = new MongoRequests_1.MongoDBInstance("testdb", "users");
router.get('/test', (req, res) => {
    res.send('Hello world');
});
router.get('/userlist', (req, res) => {
    var returnValue = mongo.returnAll((value) => {
        res.status(200).send(JSON.stringify(value));
    });
});
router.post('/adduser', (req, res) => {
    const _username = req.body.username;
    const _password = req.body.password;
    const _email = req.body.email;
    if (_username.trim() && _password.trim() && _email.trim()) {
        BlogBackend_Mongo_1.ServerAuth.registerUser(res, _username, _password, _email);
    }
});
router.post('/removeuser', (req, res) => {
    const _userID = req.body._id;
    if (_userID.trim()) {
        mongo.delete("_id", _userID);
    }
});
router.post('/edituser', (req, res) => {
    const _newUserObject = req.body.new;
    const _userID = req.body.id;
    if (_userID.trim() && _newUserObject.trim()) {
        mongo.query("_id", _userID, (err, result) => {
            if (err)
                throw err;
            if (result) {
                var queryObj = JSON.parse(result);
                var newUserObj = JSON.parse(_newUserObject);
                mongo.updateRecord(queryObj, newUserObj, (err, result) => {
                    if (err)
                        throw err;
                    res.status(200).send("Updated.");
                });
            }
            else
                res.status(400).send("Couldn't update user.");
        });
    }
});
router.get('/user', (req, res) => {
    const _byUsername = req.body.username;
    const _byId = req.body.id;
    let verb = "_id";
    let value = _byId;
    if (_byUsername) {
        verb = "username";
        value = _byUsername;
    }
    let resultingUser = undefined;
    mongo.query(verb, value, (err, result) => {
        if (err)
            throw err;
        resultingUser = result;
        if (resultingUser)
            res.status(200).send(JSON.stringify(resultingUser));
        else
            res.status(400).send('No user found.');
    });
});
exports.Controller = router;
exports.Endpoint = '/TESTING';
//# sourceMappingURL=testing.js.map
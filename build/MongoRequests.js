"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Debug_1 = require("./Debug");
var MongoDBStatus;
(function (MongoDBStatus) {
    MongoDBStatus[MongoDBStatus["OK"] = 0] = "OK";
    MongoDBStatus[MongoDBStatus["Error"] = 1] = "Error";
})(MongoDBStatus = exports.MongoDBStatus || (exports.MongoDBStatus = {}));
var mongo = require('mongodb').MongoClient;
var oid = require('mongodb').ObjectID;
class MongoDBInstance {
    constructor(collectionName, databaseName) {
        this.currentCollection = "users";
        this.currentDatabase = "testdb";
        this.allowed = true;
        this.url = "mongodb://localhost:27017/";
        this.currentCollection = collectionName;
        //this.currentDatabase = databaseName;
        /*
        mongo.connect(this.url, (err: any, db: any) => {
            if(err) throw err;
            console.log("Database created!");
            db.close();
        });
        */
    }
    query(keyName, keyValue, callback) {
        mongo.connect(this.url, (err, db) => {
            if (err) {
                callback(err, null);
                throw err;
            }
            var dbo = db.db(this.currentDatabase);
            if (keyName === "_id")
                keyValue = oid(keyValue);
            var query = { [keyName]: keyValue };
            Debug_1.DebugConsole.Write(Debug_1.DebugSeverity.DEBUG, `${this.currentDatabase}.${this.currentCollection}.query(${JSON.stringify(query)});`);
            dbo.collection(this.currentCollection).find(query).toArray((err, res) => {
                if (err) {
                    callback(err, null);
                    throw err;
                }
                callback(null, res[0]);
                db.close();
                return res[0];
            });
            db.close();
        });
    }
    /**
     *
     * @param byKey Delete by the given key (_id to use an id)
     * @param keyValue * for any
     */
    delete(byKey, keyValue) {
        mongo.connect(this.url, (err, db) => {
            if (err)
                throw err;
            var dbo = db.db(this.currentDatabase);
            if (byKey === "_id")
                keyValue = oid(keyValue);
            var query = { [byKey]: keyValue };
            console.log("delete query: ", query);
            dbo.collection(this.currentCollection).deleteOne(query, (err, res) => {
                console.log("send delete request");
                db.close();
            });
            db.close();
        });
    }
    changeCollection(collectionName) {
        Debug_1.DebugConsole.Writeq(`Collection Change: ${this.currentCollection} -> ${collectionName}`);
        this.currentCollection = collectionName;
        Debug_1.DebugConsole.Writeq(`this.currentCollection = ${collectionName}`);
    }
    changeDatabase(dbName) {
        console.log("not allowed, change collection name instead.");
        //this.currentDatabase = dbName;
    }
    deleteCollection(collectionName) {
        mongo.connect(this.url, (err, db) => {
            if (err)
                throw err;
            var dbo = db.db(this.currentDatabase);
            dbo.collection(collectionName).drop((err, delOK) => {
                if (err)
                    throw err;
                console.log("dropped collection ", collectionName, " ", delOK);
                db.close();
            });
            db.close();
        });
    }
    updateRecord(queryObj, newValues, callback) {
        var updateQuery = { $set: newValues };
        mongo.connect(this.url, (err, db) => {
            if (err)
                throw err;
            var dbo = db.db(this.currentDatabase);
            dbo.collection(this.currentCollection).updateOne(queryObj, updateQuery, (err, res) => {
                if (err)
                    throw err;
                callback(err, res);
                db.close();
            });
            db.close();
        });
    }
    returnN(n, callback) {
        mongo.connect(this.url, (err, db) => {
            if (err)
                throw err;
            var dbo = db.db(this.currentDatabase);
            dbo.collection(this.currentCollection).find().limit(n).toArray((err, res) => {
                if (err)
                    throw err;
                db.close();
                callback(err, res);
            });
        });
    }
    returnNByKey(n, key, value) {
        mongo.connect(this.url, (err, db) => {
            if (err)
                throw err;
            var dbo = db.db(this.currentDatabase);
            var queryObj = { key: value };
            dbo.collection(this.currentCollection).find(queryObj).limit(n).toArray((err, res) => {
                if (err)
                    throw err;
                console.log(res);
                db.close();
                return res;
            });
        });
        return undefined;
    }
    returnAll(callback) {
        mongo.connect(this.url, (err, db) => {
            if (err)
                throw err;
            var dbo = db.db(this.currentDatabase);
            console.log(`getting all for ${this.currentDatabase}/${this.currentCollection}`);
            dbo.collection(this.currentCollection).find({}).toArray((err, res) => {
                if (err)
                    throw err;
                callback(res);
                db.close();
            });
        });
    }
    makeCollection(collectionName) {
        mongo.connect(this.url, (err, db) => {
            if (err)
                throw err;
            var dbo = db.db(this.currentDatabase);
            dbo.createCollection(collectionName, (err, res) => {
                if (err)
                    throw err;
                db.close();
            });
        });
    }
    insertRecord(obj, callback) {
        mongo.connect(this.url, (err, db) => {
            if (err)
                throw err;
            var dbo = db.db(this.currentDatabase);
            dbo.collection(this.currentCollection).insertOne(obj, (err, res) => {
                if (err)
                    throw err;
                callback(err, res);
                db.close();
            });
        });
    }
    insertManyRecords(objs) {
        mongo.connect(this.url, (err, db) => {
            var dbo = db.db(this.currentDatabase);
            dbo.collection(this.currentCollection).insertMany(objs, (err, res) => {
                if (err)
                    throw err;
                console.log(res);
                db.close();
            });
        });
    }
}
exports.MongoDBInstance = MongoDBInstance;
//# sourceMappingURL=MongoRequests.js.map
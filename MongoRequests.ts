import { DebugConsole, DebugSeverity } from "./Debug";

export enum MongoDBStatus {
    OK, Error
}

var mongo = require('mongodb').MongoClient;
var oid = require('mongodb').ObjectID;

export class MongoDBInstance {

    public currentCollection: string = "users";
    private currentDatabase: string = "testdb";
    
    private allowed: boolean = true;
    
    private url: string = "mongodb://localhost:27017/";

    constructor(collectionName: string, databaseName: string)
    {
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

    public query(keyName: string, keyValue: string, callback: (err: any, result: any) => void) {
        mongo.connect(this.url, (err: any, db: any) => {
            if(err) {callback(err, null); throw err;}
            var dbo = db.db(this.currentDatabase);
            if(keyName === "_id")
                keyValue = oid(keyValue);
            var query = {[keyName]: keyValue};
            DebugConsole.Write(DebugSeverity.DEBUG, `${this.currentDatabase}.${this.currentCollection}.query(${JSON.stringify(query)});`);
            dbo.collection(this.currentCollection).find(query).toArray((err: any, res: any) => {
                if(err) {callback(err, null); throw err;}
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
    public delete(byKey: string, keyValue: string) {
        mongo.connect(this.url, (err: any, db: any) => {
            if(err) throw err;
            var dbo = db.db(this.currentDatabase);
            if(byKey === "_id")
                keyValue = oid(keyValue);
            var query = {[byKey]: keyValue};
            console.log("delete query: ", query);
            dbo.collection(this.currentCollection).deleteOne(query, (err: any, res: any) => {
                console.log("send delete request");
                db.close();
            });
            db.close();
        });
    }

    public changeCollection(collectionName: string) {
        DebugConsole.Writeq(`Collection Change: ${this.currentCollection} -> ${collectionName}`);
        this.currentCollection = collectionName;
        DebugConsole.Writeq(`this.currentCollection = ${collectionName}`);
    }
    public changeDatabase(dbName: string) {
        console.log("not allowed, change collection name instead.");
        //this.currentDatabase = dbName;
    }

    public deleteCollection(collectionName: string) {
        mongo.connect(this.url, (err: any, db: any) => {
            if(err) throw err;
            var dbo = db.db(this.currentDatabase);
            dbo.collection(collectionName).drop((err: any, delOK: any) => {
                if(err) throw err;
                console.log("dropped collection ", collectionName, " ", delOK);
                db.close();
            });

            db.close();
        });
    }

    public updateRecord(queryObj: any, newValues: any, callback: (err: any, res: any) => void) 
    {
        var updateQuery = {$set:newValues};
        mongo.connect(this.url, (err: any, db: any) => {
            if(err) throw err;
            var dbo = db.db(this.currentDatabase);
            dbo.collection(this.currentCollection).updateOne(queryObj, updateQuery, (err: any, res: any) => {
                if(err) throw err;
                callback(err, res);
                db.close();
            });

            db.close();
        });
    }

    public returnN(n: number, callback: (err: any, result: any) => void) {
        mongo.connect(this.url, (err: any, db: any) => {
            if(err) throw err;
            var dbo = db.db(this.currentDatabase);
            dbo.collection(this.currentCollection).find().limit(n).toArray((err: any, res: any) =>
            {
                if(err) throw err;
                db.close();
                callback(err, res);
            });
        });
    }

    public returnNByKey(n: number, key: string, value: string): any[] | undefined {
        mongo.connect(this.url, (err: any, db: any) => {
            if(err) throw err;
            var dbo = db.db(this.currentDatabase);
            var queryObj = {key: value};
            dbo.collection(this.currentCollection).find(queryObj).limit(n).toArray((err: any, res: any) =>
            {
                if(err) throw err;
                console.log(res);
                db.close();
                return res;
            });
        });

        return undefined;
    }

    public returnAll(callback: (value: any) => void) {
        mongo.connect(this.url, (err: any, db: any) => {
            if(err) throw err;
            var dbo = db.db(this.currentDatabase);
            console.log(`getting all for ${this.currentDatabase}/${this.currentCollection}`);
            dbo.collection(this.currentCollection).find({}).toArray((err: any, res: any) =>
            {
                if(err) throw err;
                callback(res);
                db.close();
            });
        });
    }

    public makeCollection(collectionName: string) {
        mongo.connect(this.url, (err: any, db: any) => {
            if(err) throw err;
            var dbo = db.db(this.currentDatabase);
            dbo.createCollection(collectionName, (err: any, res: any) => {
                if(err) throw err;
                db.close();
            });
        });
    }

    public insertRecord(obj: any, callback: (err: any, result: any) => void)
    {
        mongo.connect(this.url, (err: any, db: any) => {
            if(err) throw err;
            var dbo = db.db(this.currentDatabase);
            dbo.collection(this.currentCollection).insertOne(obj, (err: any, res: any) => {
                if(err) throw err;
                callback(err, res);
                db.close();
            });
        });
    }

    public insertManyRecords(objs: any[])
    {
        mongo.connect(this.url, (err: any, db: any) => {
            var dbo = db.db(this.currentDatabase);
            dbo.collection(this.currentCollection).insertMany(objs, (err: any, res: any) => {
                if(err) throw err;
                console.log(res);
                db.close();
            });
        });
    }
}
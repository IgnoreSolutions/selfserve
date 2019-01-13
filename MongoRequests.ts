export enum MongoDBStatus {
    OK, Error
}

export class MongoDBInstance {
    private mongo = require('mongodb').MongoClient;
    
    public currentDatabase?: string;
    private allowed: boolean = true;
    
    private url: string = "mongodb://localhost:27017/mydb";


    constructor()
    {
        this.mongo.connect()   
    }

}
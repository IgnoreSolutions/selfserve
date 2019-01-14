import express = require("express");
import TokenStore from "./TokenStore"
import {MongoDBInstance, MongoDBStatus} from "./MongoRequests";
import {stringify} from "querystring";
import { ObjectID } from "bson";

export class ShopItem implements IShopItem {
    public price: number;
    public currency: string;
    public item_name: string;
    public description: string;
    public list_date: Date;
    public images: string[];

    constructor()
    {
        this.price = 0;
        this.currency = "USD";
        this.item_name = "Item Name";
        this.description = "Write a description...";
        this.list_date = new Date(Date.now());
        this.images = ["./images/shop/placeholder.png"];
    }
}

export interface IShopItem {
    price: number;
    currency: string; // 3 letter code
    item_name: string;
    list_date: Date;
    description: string;
    images: string[]; // Array of urls to the images
}

export abstract class ShopBackend {
    
    private static mongoBackend: MongoDBInstance;

    public static initShopBackend()
    {
        this.mongoBackend = new MongoDBInstance("testdb", "shop");
    }

    public static getAllItems(callback: (value:any) => void) {
        this.mongoBackend.returnAll((value: any) => {
            callback(value);
        });
    }

    public static addNewItem(newItem: IShopItem, callback: (err: any, result: any) => void) { 
        this.mongoBackend.insertRecord(newItem, (err: any, result: any) => {
            callback(err, result);
        });
    }

    public static updateItem(__id: ObjectID, newValues: Object, callback: (err: any, result: any)=>void)
    {
        var queryObj = {_id: __id};
        this.mongoBackend.updateRecord(queryObj, newValues, (err: any, res: any) =>
        {
            callback(err, res);
        });
    }
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MongoRequests_1 = require("./MongoRequests");
class ShopItem {
    constructor() {
        this.price = 0;
        this.currency = "USD";
        this.item_name = "Item Name";
        this.description = "Write a description...";
        this.list_date = new Date(Date.now());
        this.images = ["./images/shop/placeholder.png"];
    }
}
exports.ShopItem = ShopItem;
class ShopBackend {
    static initShopBackend() {
        this.mongoBackend = new MongoRequests_1.MongoDBInstance("testdb", "shop");
    }
    static getAllItems(callback) {
        this.mongoBackend.returnAll((value) => {
            callback(value);
        });
    }
    static addNewItem(newItem, callback) {
        this.mongoBackend.insertRecord(newItem, (err, result) => {
            callback(err, result);
        });
    }
    static updateItem(__id, newValues, callback) {
        var queryObj = { _id: __id };
        this.mongoBackend.updateRecord(queryObj, newValues, (err, res) => {
            callback(err, res);
        });
    }
}
exports.ShopBackend = ShopBackend;
//# sourceMappingURL=ShopBackend.js.map
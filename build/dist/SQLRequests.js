"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mySqlModule = require("mysql");
var SQLStatus;
(function (SQLStatus) {
    SQLStatus[SQLStatus["OK"] = 0] = "OK";
    SQLStatus[SQLStatus["Error"] = 1] = "Error";
})(SQLStatus = exports.SQLStatus || (exports.SQLStatus = {}));
class MySQLInstance {
    constructor(sqlConnectionOptions) {
        this.allowed = true;
        this.sqlConnection = mySqlModule.createConnection(sqlConnectionOptions);
        if (this.sqlConnection === undefined)
            throw new Error('sqlConnection null. Check given connection options');
        else {
            this.sqlConnection.on('error', function (err) {
                console.log(err); // 'ER_BAD_DB_ERROR'
            });
            this.sqlConnection.connect((err) => {
                if (err)
                    this.allowed = false;
                else
                    this.currentDatabase = sqlConnectionOptions.database;
            });
        }
    }
    query(queryString, callback) {
        if (!this.allowed)
            return;
        this.sqlConnection.query(queryString, (err2, result2) => {
            if (err2) {
                callback(SQLStatus.Error, err2, result2);
            }
            else {
                callback(SQLStatus.OK, err2, result2);
            }
        });
    }
    changeSQLDatabase(dbName) {
        if (!this.allowed)
            return;
        this.sqlConnection.changeUser({ database: dbName }, (err) => {
            if (err) {
                throw new Error(err.message);
            }
        });
    }
}
exports.MySQLInstance = MySQLInstance;
//# sourceMappingURL=SQLRequests.js.map
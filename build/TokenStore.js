"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
class TokenStore {
    constructor() {
        this.store = new Array();
        this.doppelStore = new Array();
        //setTimeout(() => {this.periodicWrite();}, 3600 * 1000 /*3600 seconds aka 1 hr. */);
    }
    periodicWrite() {
        if (this.doppelStore !== this.store) {
            this.writeStore("user_tokens/store.json");
            this.doppelStore = this.store;
        }
    }
    verifyToken(username, token) {
        const returnValue = this.store.find((element) => {
            return (element.username === username) && (element.token === token);
        });
        return (returnValue !== undefined);
    }
    generateToken(username) {
        const returnValue = this.store.find((element) => {
            return (element.username === username);
        });
        if (returnValue !== undefined)
            return returnValue;
        const token = { token: "", username: "null" };
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789.?!@~^&";
        let result = "VSAT-";
        const maxTokenSize = 20;
        for (let i = 0; i < maxTokenSize; i++) {
            result += characters[this.getRandomInt(characters.length)];
        }
        token.token = result;
        token.username = username;
        this.store.push(token);
        this.writeStore("user_tokens/store.json");
        return token;
    }
    getRandomInt(maxValue) {
        return Math.floor(Math.random() * Math.floor(maxValue));
    }
    loadStore(path) {
        if (fs.existsSync(path)) {
            const storeContents = fs.readFileSync(path, { encoding: "utf-8" });
            const theStore = JSON.parse(storeContents);
            this.store = theStore;
            this.doppelStore = theStore;
            console.log('read token store');
        }
        // else, no store! oh well.   
    }
    writeStore(path) {
        const dummyJSObject = [];
        this.store.forEach((element) => {
            dummyJSObject.push({ username: element.username, token: element.token });
        });
        const storeAsJson = JSON.stringify(dummyJSObject);
        fs.writeFileSync(path, storeAsJson, { encoding: "utf-8" });
        console.log('wrote token store');
        console.log(dummyJSObject);
    }
}
exports.default = TokenStore;
//# sourceMappingURL=TokenStore.js.map
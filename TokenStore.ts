import fs = require('fs');


interface Token {
    username: string;
    token: string;
}

export default class TokenStore {

    private store: Token[];
    private doppelStore: Token[];

    constructor() {
        this.store = new Array<Token>();
        this.doppelStore = new Array<Token>();

        //setTimeout(() => {this.periodicWrite();}, 3600 * 1000 /*3600 seconds aka 1 hr. */);
    }

    private periodicWrite() {
        if(this.doppelStore !== this.store)
        {
            this.writeStore("user_tokens/store.json");
            this.doppelStore = this.store;
        }
    }

    public verifyToken(username: string, token: string): boolean {
        const returnValue = this.store.find((element): boolean => {
            return (element.username === username) && (element.token === token);
        });
        return (returnValue !== undefined);
    }

    public generateToken(username: string): Token {
        const returnValue = this.store.find((element): boolean => {
            return (element.username === username);
        });
        if(returnValue !== undefined)
            return returnValue!;


        const token = {token: "", username: "null"};
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

    private getRandomInt(maxValue: number) {
        return Math.floor(Math.random() * Math.floor(maxValue));
    }

    public loadStore(path: string) {
        if(fs.existsSync(path))
        {
            const storeContents: string = fs.readFileSync(path, {encoding: "utf-8"});
            const theStore: Token[] = JSON.parse(storeContents);
            this.store = theStore;
            this.doppelStore = theStore;
            console.log('read token store');
        }
        // else, no store! oh well.   
    }

    public writeStore(path: string) {
        const dummyJSObject: any = [];
        this.store.forEach((element) => {
            dummyJSObject.push({username: element.username, token: element.token});
        });

        const storeAsJson: string = JSON.stringify(dummyJSObject);
        fs.writeFileSync(path, storeAsJson, {encoding: "utf-8"});
        console.log('wrote token store');
        console.log(dummyJSObject);
    }
}

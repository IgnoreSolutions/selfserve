import { stringify } from "querystring";

export enum DebugSeverity {
    /** do not set VERBOSE as a level in the Write function. */
    VERBOSE = 0,

    /** these are the values you want to use. */
    DEBUG = 1,
    WARNING,
    ERROR,
    FATAL
}

export class DebugConsole {
    private static debugEnabled: boolean = false;
    private static printLevel: DebugSeverity = DebugSeverity.VERBOSE;

    public static setDebugEnabled(en: boolean) {this.debugEnabled = en;}
    public static getDebugEnabled(){return this.debugEnabled};

    private static EnumToString(enumerator: any, value: any): string {
        return enumerator[value];
    }

    public static Writeq = (...args: any[]) => DebugConsole.Write(DebugSeverity.DEBUG, ...args);

    public static Write(level: DebugSeverity = DebugSeverity.DEBUG, ...args: any[]): void {
        if(args.length === 0) return; //nope fuck you.

        let d: Date = new Date(Date.now());
        process.stdout.write(`[SELFSERVE ${DebugConsole.EnumToString(DebugSeverity, level)}] [${d.toLocaleDateString()} ${d.toLocaleTimeString()}]: `);
        if(args.length > 1)
        {
            args.forEach((value: any, index: number) => {
                if(level > this.printLevel)
                {
                    d = new Date(Date.now()); // TODO: not create a new fucking date object every loop????
                    if(value)  process.stdout.write(value);
                    else process.stdout.write("[undefined object]");
                }
            });
        }
        else    process.stdout.write(`[SELFSERVE ${level}] [${d.toLocaleDateString()} ${d.toLocaleTimeString()}]: ${args[0]}`);
        process.stdout.write('\n');
    }
    
}
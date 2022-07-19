import * as _ from 'lodash';

// eslint-disable-next-line @typescript-eslint/naming-convention
export class val<TYPE = any> {
    private constructor(base: TYPE, path?: string) {
        this.base = base;
    }
    private readonly base: TYPE;
    private path: string;
    private tcPath: string;
    private toCompare: TYPE;
    private resultValue = true;

    public static init<T = any>(base: T, path?: string) {
        return new val<T>(base, path);
    }

    public get = (i: any, s: string = this.path) => (s ? _.get(i, s, null) : i);

    public pipe(pipeCB: Function) {
        return (tc, tcPath?: string) => {
            this.toCompare = tc;
            this.tcPath = tcPath;
            this.resultValue = pipeCB(this, this.get(this.base), this.get(tc, tcPath));
            return this;
        };
    }

    getResult(): boolean {
        return this.resultValue;
    }
}

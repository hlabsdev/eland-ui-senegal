import { BehaviorSubject, Observable, of } from 'rxjs';

export class DataCollection<t, k> {
    private _collection: { [key: string]: { _?: BehaviorSubject<t>; $?: Observable<t>; value?: t } } = {};

    public set(key: k, value: t) {
        if (this._collection[key.toString()]) {
            this._collection[key.toString()]._.next(value);
            this._collection[key.toString()].value = value;
        } else {
            this._collection[key.toString()] = {};
            this._collection[key.toString()]._ = new BehaviorSubject<t>(value);
            this._collection[key.toString()].$ = this._collection[key.toString()]._.asObservable();
            this._collection[key.toString()].value = value;
        }
    }

    public remove(key: k) {
        delete this._collection[key.toString()];
    }

    public get$(key: k): Observable<t> {
        if (this._collection[key.toString()]) {
            return this._collection[key.toString()].$;
        } else {
            return of<t>(null);
        }
    }

    public get(key: k): t {
        return this._collection[key.toString()].value;
    }

    public clear() {
        this._collection = {};
    }
}

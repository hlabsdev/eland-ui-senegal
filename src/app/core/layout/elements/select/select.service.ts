import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class SelectService {
    private _select = new Subject();
    select$ = this._select.asObservable();

    constructor() {}

    select(value) {
        this._select.next(value);
    }
}

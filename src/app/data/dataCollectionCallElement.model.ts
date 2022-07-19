import { BehaviorSubject, Observable } from 'rxjs';
import { Service } from '@app/data/service.model';
import { fn$ } from '@app/data/models/fn$.model';

export class DataCollectionCallElement {
    private _: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    public $: Observable<any> = this._.asObservable();
    private fn: fn$;
    private readonly name: string;

    constructor(name: string, fn?: fn$) {
        this.name = name;
        this.setFn(fn);
    }

    setFn = (fn: fn$) => (this.fn = fn || this.fn);
    sideSetFn = (fn: fn$) => this.setFn(fn) && this;

    setNewServices = (services: Service[]): DataCollectionCallElement => {
        services.forEach((service) => service.changed$.subscribe(() => this.update()));
        return this;
    };

    getFn = (): fn$ => this.fn;
    getName = (): string => this.name;
    getValue = (): any => this._.getValue();
    update = () => (this.fn ? this.fn().subscribe((v) => this._.next(v)) : null);
}

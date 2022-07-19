import { BehaviorSubject } from 'rxjs';

export class Service {
    private _ = new BehaviorSubject<string>(null);
    public changed$ = this._.asObservable();
    name: string;
    id: string;

    constructor(name: string, id?: string) {
        this.name = name;
        this.id = id;
    }

    update(newId: string) {
        if (this.id !== newId) {
            this.id = newId;
            this._.next(this.name);
        }
    }
}

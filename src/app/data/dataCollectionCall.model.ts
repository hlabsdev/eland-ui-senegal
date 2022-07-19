import { Observable } from 'rxjs';
import { DataCollectionCallElement } from '@app/data/dataCollectionCallElement.model';
import { Service } from '@app/data/service.model';
import * as _ from 'lodash';
import { DataElement } from '@app/data/models/dataElement.model';

export class DataCollectionCall<t> {
    private _services: { [name: string]: Service } = {};
    private _collection: { [name: string]: DataCollectionCallElement } = {};

    public addElement = (element: DataElement): Observable<t> =>
        this.getOrCreateCollElement(element.name)
            .sideSetFn(element.fn)
            .setNewServices(this.getOrCreateServices(element.serviceNames.map((service) => ({ name: service })))).$;

    public addElements = (elements: DataElement[]): Observable<t>[] => elements.map(this.addElement);

    public getOrCreateCollElement = (name: string): DataCollectionCallElement =>
        this._collection[name] ? this._collection[name] : this.createCollElement(name);

    public getOrCreateService = (name: string, id?: string): Service =>
        this._services[name] ? this._services[name] : this.createService(name, id);

    public getOrCreateServices = (services: ServiceUpdate[]) =>
        services.map((service) => this.getOrCreateService(service.name, service.id));

    public createCollElement = (name: string): DataCollectionCallElement =>
        (this._collection[name] = new DataCollectionCallElement(name));

    public createService = (name: string, id?: string): Service => (this._services[name] = new Service(name, id));

    public update = (services: ServiceUpdate[]) =>
        services.forEach((service) => this.getOrCreateService(service.name).update(service.id));

    public getCollectionKeys = (): string[] => Object.keys(this._collection);

    public getFilteredCollectionKeys = (filter: string): string[] =>
        _.filter(this.getCollectionKeys(), (key) => key.includes(filter));

    public getServiceKeys = (): string[] => Object.keys(this._services);

    public removeOne = (key: string) => delete this._collection[key.toString()];

    public removeOneFiltered = (key: string, filterFn: (name: string) => boolean) =>
        filterFn(key) && this.removeOne(key);

    public removeSomeFiltered = (keys: string[], filterFn: (name: string) => boolean) =>
        keys.forEach((k) => this.removeOneFiltered(k, filterFn));

    public removeAllCollSomeFiltered = (filterFn: (name: string) => boolean) =>
        this.removeSomeFiltered(this.getCollectionKeys(), filterFn);

    public removeSomeCollSomeFiltered = (collFilter: string, filterFn: (name: string) => boolean) =>
        this.removeSomeFiltered(this.getFilteredCollectionKeys(collFilter), filterFn);

    public get$ = (name: string): Observable<t> => this.getOrCreateCollElement(name).$;

    public get = (name: string): t => this.getOrCreateCollElement(name).getValue();

    public clear = () => (this._collection = {});
}

export interface ServiceUpdate {
    name: string;
    id?: string;
}

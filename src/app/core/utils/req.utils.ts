import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConstructorInterface } from '@app/core/interfaces/constructor.interface';
import { Observable } from 'rxjs';
import { DeleteResult } from 'typeorm';

@Injectable()
export class ReqUtils<T extends ConstructorInterface<T> | ConstructorInterface<T[]>> {
    private _url: string;

    constructor(private http: HttpClient, url: string) {
        this._url = url;
    }

    public setUrl = (url: string) => (this._url = url);
    public getAll = (): Observable<T[]> => this.http.get<T[]>(this._url);
    public getOne = (id: string): Observable<T> => this.http.get<T>(`${this._url}/${id}`);
    public setOne = (item: T, id?: string): Observable<T> =>
        this.http[id || item['id'] ? 'put' : 'post']<T>(`${this._url}/${id || item['id'] || ''}`, item);
    public delOne = (id: string): Observable<DeleteResult> => this.http.delete<DeleteResult>(`${this._url}/${id}`);
}

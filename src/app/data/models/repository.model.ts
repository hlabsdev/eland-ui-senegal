import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DeleteResult } from 'typeorm';
import { throwError as observableThrowError } from 'rxjs/internal/observable/throwError';
import { HttpClient } from '@angular/common/http';
import { xxFN } from '@app/data/models/types/fns.type';
import { RepoOptions } from '@app/data/models/interfaces/RepoOptions.interface';

export abstract class Repository<P = any> {
    protected constructor(http: HttpClient, url = '') {
        this._baseUrl = url;
        this.http = http;
    }

    http: HttpClient;

    _baseUrl = '';

    getUrl = (subUrl) => `${this._baseUrl}/${subUrl}`;

    setBaseUrl = (url: string) => (this._baseUrl = url);

    private _handleError(error: any): Observable<any> {
        console.error('An error occurred ', error);
        return observableThrowError(error);
    }

    private addId = (url: string, id: string): string => `${url}/${id}`;

    private get = <T = P>(url: string): Observable<T> => this.http.get<T>(url);

    private _get = <T = P>(options: RepoOptions<T>): Observable<T> =>
        this.get<T[]>(options.url).pipe(map(options.exec), catchError(this._handleError));

    private _set = <T = P>(options: RepoOptions<T>): Observable<T> =>
        options.item['id']
            ? this.http.put<T>(this.addId(options.url, options.item['id']), options.item)
            : this.http.post<T>(options.url, options.item);

    private _del = <T = P>(options: RepoOptions<T>): Observable<DeleteResult> =>
        this.http.delete<DeleteResult>(this.addId(options.url, options.id));

    private _getAll = <T = P>(options: RepoOptions<T>): Observable<T[]> =>
        this.get<T[]>(options.url).pipe(
            map((es: T[]) => es.map(options.exec)),
            catchError(this._handleError),
        );

    private _getOne = <T = P>(options: RepoOptions<T>): Observable<T> =>
        this.get<T>(this.addId(options.url, options.id)).pipe(map(options.exec), catchError(this._handleError));

    private _getServices = <T = P>(options: RepoOptions<T>) => ({
        get: (): Observable<T> => this._get<T>(options),
        getAll: (): Observable<T[]> => this._getAll<T>(options),
        getOne: (id: string): Observable<T> => this._getOne<T>({ ...options, id }),
        delOne: (id: string): Observable<DeleteResult> => this._del<T>({ ...options, id }),
        setOne: (item: T): Observable<T> => this._set<T>({ ...options, item }),
    });

    getServices = <T = P>(endUrl: string, exec: xxFN<any, T> = (obj) => obj): any =>
        this._getServices({ url: this.getUrl(endUrl), exec });
    getServicesInterpolation = <T = any>(
        endUrlFn: xxFN<any, string>,
        interpolation: any,
        exec: xxFN<any, T> = (obj) => obj,
    ) => this.getServices(endUrlFn(interpolation), exec);
}

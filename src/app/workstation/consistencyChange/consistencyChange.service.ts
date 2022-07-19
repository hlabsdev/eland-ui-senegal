import { Injectable } from '@angular/core';
import { environment as config } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { throwError as observableThrowError } from 'rxjs/internal/observable/throwError';
import { ConsistencyChange, ConsistencyChangeGroup } from '../../core/models/consistencyChange.model';

@Injectable()
export class ConsistencyChangeService {
    private apiUrl = `${config.api}`;
    private countrySpecificUrl = '/sn/v1';
    private requestUrl = this.apiUrl + this.countrySpecificUrl;
    private ccUrl = this.requestUrl + '/consistencyChange';
    private ccgUrl = this.requestUrl + '/consistencyChangeGroup';

    constructor(private http: HttpClient) {}

    // consistency change webservices
    cc = {
        all: (groupId?: string): Observable<ConsistencyChange[]> => {
            const options: { params?: HttpParams } = {};
            if (groupId) {
                options.params = new HttpParams().set('groupId', groupId);
            }
            return this.http.get<ConsistencyChange[]>(`${this.ccUrl}`, options).pipe(
                map((response) => response.map((app) => new ConsistencyChange(app))),
                catchError(this.handleError),
            );
        },
        get: (ccId: string): Observable<ConsistencyChange> =>
            this.http.get<ConsistencyChange>(`${this.ccUrl}/${ccId}`).pipe(
                map((ccResp) => new ConsistencyChange(ccResp)),
                catchError(this.handleError),
            ),
        create: (cc: ConsistencyChange): Observable<ConsistencyChange> =>
            this.http.post<ConsistencyChange>(`${this.ccUrl}`, cc.getCleanVersion()).pipe(
                map((ccResp) => new ConsistencyChange(ccResp)),
                catchError(this.handleError),
            ),
        update: (cc: ConsistencyChange): Observable<ConsistencyChange> =>
            this.http.put<ConsistencyChange>(`${this.ccUrl}/${cc.id}`, cc.getCleanVersion()).pipe(
                map((ccResp) => new ConsistencyChange(ccResp)),
                catchError(this.handleError),
            ),
        delete: (ccId: string): Observable<any> =>
            this.http.delete(`${this.ccUrl}/${ccId}`).pipe(catchError(this.handleError)),
    };
    ccg = {
        get: (ccgId?: string): Observable<ConsistencyChangeGroup> =>
            this.http.get<ConsistencyChangeGroup>(`${this.ccgUrl}/${ccgId}`).pipe(
                map((ccgResp) => new ConsistencyChangeGroup(ccgResp)),
                catchError(this.handleError),
            ),
        create: (ccg: ConsistencyChangeGroup): Observable<ConsistencyChangeGroup> =>
            this.http.post<ConsistencyChangeGroup>(`${this.ccgUrl}`, ccg.getCleanVersionWithChildCleanVersion()).pipe(
                map((ccgResp) => new ConsistencyChangeGroup(ccgResp)),
                catchError(this.handleError),
            ),
        update: (ccg: ConsistencyChangeGroup): Observable<ConsistencyChangeGroup> =>
            this.http
                .put<ConsistencyChangeGroup>(`${this.ccgUrl}/${ccg.id}`, ccg.getCleanVersionWithChildCleanVersion())
                .pipe(
                    map((ccgResp) => new ConsistencyChangeGroup(ccgResp)),
                    catchError(this.handleError),
                ),
        delete: (ccgId: string): Observable<any> =>
            this.http.delete(`${this.ccgUrl}/${ccgId}`).pipe(catchError(this.handleError)),
    };

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }
}

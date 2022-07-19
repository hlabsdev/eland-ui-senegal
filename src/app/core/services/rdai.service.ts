import { throwError as observableThrowError, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as config } from 'environments/environment';
import { map, catchError } from 'rxjs/operators';
import { Rdai } from '@app/core/models/rdai.model';
import { PaginatedResults } from '@app/core/models/paginatedResults.model';
import Utils from '@app/core/utils/utils';

@Injectable()
export class RdaiService {
    private apiUrl = `${config.api}`;
    private countrySpecificUrl = '/sn/v1';
    private requestUrl = this.apiUrl + this.countrySpecificUrl;

    constructor(private http: HttpClient) {}

    getRdais(args: any = {}): Observable<PaginatedResults> {
        let params = new HttpParams();

        params = Utils.setParamsFromArgs(params, args);

        if (args.search) {
            const value = String(args.search);
            if (value.indexOf('/') > -1) {
                const values: string[] = value.split('/');
                params = params.set('titleId', values[0]);
                params = params.set('district', values[1].toUpperCase());
            } else {
                params = params.set('titleId', args.search);
                params = params.set('district', args.search.toUpperCase());
            }
        }

        return this.http.get<PaginatedResults>(`${this.requestUrl}/rdais`, { params }).pipe(
            map((response) => {
                response.content = response.content.map((app) => new Rdai(app));
                return new PaginatedResults(response);
            }),
            catchError(this.handleError),
        );
    }

    getRdaiById(id: string): Observable<Rdai> {
        return this.http.get<Rdai>(`${this.requestUrl}/rdais/${id}`).pipe(
            map((response) => new Rdai(response)),
            catchError(this.handleError),
        );
    }

    getRdai(rdai: Rdai): Observable<Rdai> {
        return this.http.get<Rdai>(`${this.requestUrl}/rdais/${rdai.id}`).pipe(
            map((response) => new Rdai(response)),
            catchError(this.handleError),
        );
    }

    updateRdai(rdai: Rdai): Observable<Rdai> {
        return this.http.put<Rdai>(`${this.requestUrl}/rdais/${rdai.id}`, rdai).pipe(
            map((response) => new Rdai(response)),
            catchError(this.handleError),
        );
    }

    createRdai(rdai: Rdai): Observable<Rdai> {
        return this.http.post<Rdai>(`${this.requestUrl}/rdais`, rdai).pipe(
            map((response) => new Rdai(response)),
            catchError(this.handleError),
        );
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }

    getNextAvailableRegistryId(rdai: Rdai): Observable<Rdai> {
        return this.http.get(`${this.requestUrl}/rdais/registry/${rdai.registry.id}`).pipe(
            map((response: Rdai) => new Rdai(response)),
            catchError(this.handleError),
        );
    }
}

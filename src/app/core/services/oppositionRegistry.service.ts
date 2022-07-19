import { throwError as observableThrowError, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as config } from 'environments/environment';
import { map, catchError } from 'rxjs/operators';
import { OppositionRegistry } from '@app/core/models/oppositionRegistry.model';
import { PaginatedResults } from '@app/core/models/paginatedResults.model';
import Utils from '@app/core/utils/utils';

@Injectable()
export class OppositionRegistryService {
    private apiUrl = `${config.api}`;
    private countrySpecificUrl = '/sn/v1';
    private requestUrl = this.apiUrl + this.countrySpecificUrl;

    constructor(private http: HttpClient) {}

    getOppositionsRegistry(args: any = {}): Observable<PaginatedResults> {
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
        return this.http.get<PaginatedResults>(`${this.requestUrl}/oppositionregistry`, { params }).pipe(
            map((response) => {
                response.content = response.content.map((app) => new OppositionRegistry(app));
                return new PaginatedResults(response);
            }),
            catchError(this.handleError),
        );
    }
    getOppositionRegistry(oppositionRegistry: OppositionRegistry): Observable<OppositionRegistry> {
        return this.http.get<OppositionRegistry>(`${this.requestUrl}/oppositionregistry/${oppositionRegistry.id}`).pipe(
            map((response) => new OppositionRegistry(response)),
            catchError(this.handleError),
        );
    }

    createOppositionRegistry(oppositionRegistry: OppositionRegistry): Observable<OppositionRegistry> {
        return this.http.post<OppositionRegistry>(`${this.requestUrl}/oppositionregistry`, oppositionRegistry).pipe(
            map((response) => new OppositionRegistry(response)),
            catchError(this.handleError),
        );
    }

    updateOppositionRegistry(oppositionRegistry: OppositionRegistry): Observable<OppositionRegistry> {
        return this.http
            .put<OppositionRegistry>(
                `${this.requestUrl}/oppositionregistry/${oppositionRegistry.id}`,
                OppositionRegistry,
            )
            .pipe(
                map((response) => new OppositionRegistry(response)),
                catchError(this.handleError),
            );
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }

    getNextAvailableRegistryId(idRegsitry: string): Observable<OppositionRegistry> {
        return this.http.get(`${this.requestUrl}/oppositionregistry/registry/${idRegsitry}`).pipe(
            map((response: OppositionRegistry) => new OppositionRegistry(response)),
            catchError(this.handleError),
        );
    }
}

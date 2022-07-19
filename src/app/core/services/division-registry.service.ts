import { throwError as observableThrowError, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as config } from 'environments/environment';
import { map, catchError } from 'rxjs/operators';
import { PaginatedResults } from '@app/core/models/paginatedResults.model';
import Utils from '@app/core/utils/utils';
import { DivisionRegistry } from '@app/core/models/divisionRegistry.model';

@Injectable()
export class DivisionRegistryService {
    private apiUrl = `${config.api}`;
    private countrySpecificUrl = '/sn/v1';
    private requestUrl = this.apiUrl + this.countrySpecificUrl;

    constructor(private http: HttpClient) {}

    getDivisionRegistries(args: any = {}): Observable<PaginatedResults> {
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
        return this.http.get<PaginatedResults>(`${this.requestUrl}/divisionregistry`, { params }).pipe(
            map((response) => {
                response.content = response.content.map((app) => new DivisionRegistry(app));
                return new PaginatedResults(response);
            }),
            catchError(this.handleError),
        );
    }

    getDivisionRegistryById(id: string): Observable<DivisionRegistry> {
        return this.http.get<DivisionRegistry>(`${this.requestUrl}/divisionregistry/${id}`).pipe(
            map((response) => new DivisionRegistry(response)),
            catchError(this.handleError),
        );
    }

    getDivisionRegistry(divisionRegistry: DivisionRegistry): Observable<DivisionRegistry> {
        return this.http.get<DivisionRegistry>(`${this.requestUrl}/divisionregistry/${divisionRegistry.id}`).pipe(
            map((response) => new DivisionRegistry(response)),
            catchError(this.handleError),
        );
    }

    updateDivisionRegistry(divisionRegistry: DivisionRegistry): Observable<DivisionRegistry> {
        return this.http
            .put<DivisionRegistry>(`${this.requestUrl}/divisionregistry/${divisionRegistry.id}`, DivisionRegistry)
            .pipe(
                map((response) => new DivisionRegistry(response)),
                catchError(this.handleError),
            );
    }

    createDivisionRegistry(divisionRegistry: DivisionRegistry): Observable<DivisionRegistry> {
        return this.http.post<DivisionRegistry>(`${this.requestUrl}/divisionregistry`, divisionRegistry).pipe(
            map((response) => new DivisionRegistry(response)),
            catchError(this.handleError),
        );
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }

    getNextAvailableRegistryId(divisionRegistry: DivisionRegistry): Observable<DivisionRegistry> {
        return this.http.get(`${this.requestUrl}/divisionregistry/registry/${divisionRegistry.registry.id}`).pipe(
            map((response: DivisionRegistry) => new DivisionRegistry(response)),
            catchError(this.handleError),
        );
    }
}

import { throwError as observableThrowError, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as config } from 'environments/environment';
import { map, catchError } from 'rxjs/operators';
import Utils from '@app/core/utils/utils';
import { PaginatedResults } from '../models/paginatedResults.model';
import { GeneralFormalityRegistry } from '../models/generalFormalityRegistry.model';

@Injectable()
export class GeneralFormalityRegistryService {
    private apiUrl = `${config.api}`;
    private countrySpecificUrl = '/sn/v1';
    private requestUrl = this.apiUrl + this.countrySpecificUrl;

    constructor(private http: HttpClient) {}

    getGeneralFormalityRegistry(args: any = {}): Observable<PaginatedResults> {
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

        return this.http.get<PaginatedResults>(`${this.requestUrl}/generalformalityregistry`, { params }).pipe(
            map((response) => {
                response.content = response.content.map((app) => new GeneralFormalityRegistry(app));
                return new PaginatedResults(response);
            }),
            catchError(this.handleError),
        );
    }
    updateGeneralFormalityRegistry(
        generalFormalityRegistry: GeneralFormalityRegistry,
    ): Observable<GeneralFormalityRegistry> {
        return this.http
            .put<GeneralFormalityRegistry>(
                `${this.requestUrl}/generalformalityregistry/${generalFormalityRegistry.id}`,
                GeneralFormalityRegistry,
            )
            .pipe(
                map((response) => new GeneralFormalityRegistry(response)),
                catchError(this.handleError),
            );
    }
    createGeneralFormalityRegistry(
        generalFormalityRegistry: GeneralFormalityRegistry,
    ): Observable<GeneralFormalityRegistry> {
        return this.http
            .post<GeneralFormalityRegistry>(`${this.requestUrl}/generalformalityregistry`, generalFormalityRegistry)
            .pipe(
                map((response) => new GeneralFormalityRegistry(response)),
                catchError(this.handleError),
            );
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }
    getNextAvailableRegistryId(
        generalFormalityRegistry: GeneralFormalityRegistry,
    ): Observable<GeneralFormalityRegistry> {
        return this.http
            .get(`${this.requestUrl}/generalformalityregistry/registry/${generalFormalityRegistry.registry.id}`)
            .pipe(
                map((response: GeneralFormalityRegistry) => new GeneralFormalityRegistry(response)),
                catchError(this.handleError),
            );
    }
}

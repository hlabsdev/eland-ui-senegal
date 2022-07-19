import { environment as config } from 'environments/environment';
import { Observable, throwError as observableThrowError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Application } from '@app/core/models/application.model';
import { PaginatedResults } from '@app/core/models/paginatedResults.model';
import { ApplicationStatus } from '@app/core/models/applicationStatus.model';
import Utils from '@app/core/utils/utils';

@Injectable()
export class ApplicationService {
    private apiUrl = `${config.api}`;
    private countrySpecificUrl = '/v1';
    private requestUrl = this.apiUrl + this.countrySpecificUrl;

    constructor(private http: HttpClient) {}

    getApplicationStatus(args: any = {}): Observable<ApplicationStatus[]> {
        return this.http.get(`${this.requestUrl}/applications/application-status`).pipe(
            map((response: any[]) => response.map((applicationStatus) => new ApplicationStatus(applicationStatus))),
            catchError(this.handleError),
        );
    }

    getApplications(args: any = {}): Observable<PaginatedResults> {
        let params = new HttpParams();
        const fomattFiltreLang = 'fr-CA';
        const fomattJsonFiltre = { year: 'numeric', month: '2-digit', day: '2-digit' };

        if (args.searchAppNum !== '') {
            params = params.set('applicationNumber', args.searchAppNum.replace('/', '_'));
        }
        if (args.searchRefNum !== '') {
            params = params.set('referenceNumber', args.searchRefNum.replace('/', '_'));
        }
        if (args.searchAppPurpose !== '') {
            params = params.set('applicationPurpose', args.searchAppPurpose);
        }
        if (args.searchFullName !== '') {
            params = params.set('displayName', args.searchFullName);
        }
        if (args.searchStatus !== '') {
            params = params.set('status', args.searchStatus);
        }
        if (args.searchAppDate !== '') {
            params = params.set(
                'applicationDate',
                args.searchAppDate.toLocaleDateString(fomattFiltreLang, fomattJsonFiltre),
            );
        }

        params = Utils.setParamsFromArgs(params, args);

        return this.http.get<PaginatedResults>(`${this.requestUrl}/applications`, { params }).pipe(
            map((response) => {
                response.content = response.content.map((app) => new Application(app));
                return new PaginatedResults(response);
            }),
            catchError(this.handleError),
        );
    }

    createApplication(application: Application): Observable<Application> {
        return this.http.post<Application>(`${this.requestUrl}/applications`, application).pipe(
            map((response) => new Application(response)),
            catchError(this.handleError),
        );
    }

    updateApplication(application: Application): Observable<Application> {
        return this.http.put<Application>(`${this.requestUrl}/applications/${application.id}`, application).pipe(
            map((response) => new Application(response)),
            catchError(this.handleError),
        );
    }

    getApplication(id: string): Observable<Application> {
        return this.http.get<Application>(`${this.requestUrl}/applications/${id}`).pipe(
            map((response) => new Application(response)),
            catchError(this.handleError),
        );
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }
}

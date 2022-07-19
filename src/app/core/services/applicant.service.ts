import { throwError as observableThrowError, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment as config } from 'environments/environment';
import { map, catchError } from 'rxjs/operators';
import { Applicant } from '@app/core/models/applicant.model';

@Injectable()
export class ApplicantService {
    private apiUrl = `${config.api}`;
    private countrySpecificUrl = '/sn/v1';
    private requestUrl = this.apiUrl + this.countrySpecificUrl;

    constructor(private http: HttpClient) {}

    getApplicants(): Observable<Applicant[]> {
        return this.http.get<Applicant[]>(`${this.requestUrl}/applicants`).pipe(
            map((response) => response.map((app) => new Applicant(app))),
            catchError(this.handleError),
        );
    }

    getApplicant(applicant: Applicant): Observable<Applicant> {
        return this.http.get<Applicant>(`${this.requestUrl}/applicants/${applicant.id}`).pipe(
            map((response) => new Applicant(response)),
            catchError(this.handleError),
        );
    }

    updateApplicant(applicant: Applicant): Observable<Applicant> {
        return this.http.put<Applicant>(`${this.requestUrl}/applicants/${applicant.id}`, applicant).pipe(
            map((response) => new Applicant(response)),
            catchError(this.handleError),
        );
    }
    createApplicant(applicant: Applicant): Observable<Applicant> {
        return this.http.post<Applicant>(`${this.requestUrl}/applicants`, applicant).pipe(
            map((response) => new Applicant(response)),
            catchError(this.handleError),
        );
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }
}

import { Injectable } from '@angular/core';
import { environment as config } from 'environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError as observableThrowError } from 'rxjs';
import { RegisterAct } from '@app/core/models/registerAct.model';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class RegisterActService {
    private requestUrl = `${config.api}/sn/v1`;
    constructor(private http: HttpClient) {}
    getRegisterAct(id: string): Observable<RegisterAct> {
        return this.http.get<RegisterAct>(`${this.requestUrl}/rda/${id}`).pipe(
            map((response) => new RegisterAct(response)),
            catchError(this.handleError),
        );
    }

    updateRegistreAct(rda: RegisterAct): Observable<RegisterAct> {
        return this.http.put(`${this.requestUrl}/rda/${rda.id}`, rda).pipe(
            map((response) => new RegisterAct(response)),
            catchError(this.handleError),
        );
    }

    createRegisterAct(rda: RegisterAct): Observable<RegisterAct> {
        return this.http.post<RegisterAct>(`${this.requestUrl}/rda`, rda).pipe(
            map((response) => new RegisterAct(response)),
            catchError(this.handleError),
        );
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }
}

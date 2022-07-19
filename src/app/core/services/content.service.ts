import { throwError as observableThrowError, Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as config } from 'environments/environment';
import { map, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import { GenericDocument } from '@app/core/models/genericDocument.model';

@Injectable()
export class ContentService {
    private countrySpecifique = '/sn';
    private endpointUrl = `${config.api}${this.countrySpecifique}/v1/content`;

    constructor(private http: HttpClient) {}

    getTemplate(args: any = {}): Observable<GenericDocument> {
        let params = new HttpParams();
        _.mapKeys(args, (value, key) => (params = params.set(key, value)));
        return this.http.get(`${this.endpointUrl}`, { params }).pipe(
            map((response: GenericDocument) => new GenericDocument(response)),
            catchError(this.handleError),
        );
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }
}

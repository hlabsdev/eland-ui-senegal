import { throwError as observableThrowError, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { environment as config } from 'environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Party } from '@app/core/models/party.model';
import { PaginatedResults } from '@app/core/models/paginatedResults.model';
import * as _ from 'lodash';
import { ModelFactory } from '../utils/model.factory';

@Injectable()
export class PartyService {
    private endpointUrl = `${config.api}`;
    private countrySpecificUrl = '/sn/v1/parties';
    private requestUrl = this.endpointUrl + this.countrySpecificUrl;

    constructor(private http: HttpClient) {}

    getParties(args: any = {}): Observable<PaginatedResults> {
        let params = new HttpParams();
        if (args.page) {
            params = params.set('page', args.page);
        }
        if (args.perPage) {
            params = params.set('perPage', args.perPage);
        }
        if (args.orderBy) {
            params = params.set('orderBy', args.orderBy);

            if (args.direction) {
                if (args.direction === -1) {
                    params = params.set('direction', 'ASC');
                } else {
                    params = params.set('direction', 'DESC');
                }
            }
        }

        return this.http.get<PaginatedResults>(this.requestUrl, { params }).pipe(
            map((response) => {
                response.content = response.content.map(ModelFactory.managePartyPolymorphism);
                return new PaginatedResults(response);
            }),
            catchError(this.handleError),
        );
    }

    getParty(partyId: string): Observable<Party> {
        return this.http
            .get(`${this.requestUrl}/${partyId}`)
            .pipe(map(ModelFactory.managePartyPolymorphism), catchError(this.handleError));
    }

    updateParty(party: Party): Observable<Party> {
        return this.http
            .put(`${this.requestUrl}/${party.pid}`, party)
            .pipe(map(ModelFactory.managePartyPolymorphism), catchError(this.handleError));
    }

    createParty(party: Party): Observable<Party> {
        return this.http
            .post(this.requestUrl, party)
            .pipe(map(ModelFactory.managePartyPolymorphism), catchError(this.handleError));
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }

    getSigtasParty(partyUserSin: string, partyUserType: number): Observable<Party> {
        return this.http
            .get(`${this.requestUrl}/${partyUserType}/${partyUserSin}`)
            .pipe(map(ModelFactory.managePartyPolymorphism), catchError(this.handleError));
    }
}

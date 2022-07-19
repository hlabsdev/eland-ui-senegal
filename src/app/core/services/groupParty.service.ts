import { throwError as observableThrowError, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment as config } from 'environments/environment';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { GroupParty } from '@app/core/models/groupParty.model';

@Injectable()
export class GroupPartyService {
    private endpointUrl = `${config.api}/v1`;

    constructor(private http: HttpClient) {}

    getGroupParties(): Observable<GroupParty[]> {
        return this.http.get<GroupParty[]>(`${this.endpointUrl}/group-parties`).pipe(
            map((response) => response.map((gp) => new GroupParty(gp))),
            catchError(this.handleError),
        );
    }

    getGroupParty(partyId: string): Observable<GroupParty> {
        return this.http.get<GroupParty>(`${this.endpointUrl}/group-parties/${partyId}`).pipe(
            map((response) => new GroupParty(response)),
            catchError(this.handleError),
        );
    }

    updateGroupParty(party: GroupParty): Observable<GroupParty> {
        return this.http.put<GroupParty>(`${this.endpointUrl}/group-parties/${party.pid}`, party).pipe(
            map((response) => new GroupParty(response)),
            catchError(this.handleError),
        );
    }

    createGroupParty(party: GroupParty): Observable<GroupParty> {
        return this.http.post<GroupParty>(`${this.endpointUrl}/group-parties`, party).pipe(
            map((response) => new GroupParty(response)),
            catchError(this.handleError),
        );
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }
}

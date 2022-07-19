import { Injectable } from '@angular/core';
import { throwError as observableThrowError, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Group } from '@app/core/models/group.model';
import { User } from '@app/core/models/user.model';
import { map, catchError } from 'rxjs/operators';
import { environment as config } from 'environments/environment';
import * as _ from 'lodash';

@Injectable()
export class GroupService {
    private workflowEndpointURL = `${config.workflowApi}/engine-rest`;

    constructor(private http: HttpClient) {}

    getUserGroupsByUser(user: User): Observable<Group[]> {
        return this.getGroups({ member: user.username });
    }

    getUserGroupsByUserName(username: string): Observable<Group[]> {
        return this.getGroups({ member: username });
    }

    getGroupsByType(type: string): Observable<Group[]> {
        return this.getGroups({ type });
    }

    getGroups(args): Observable<Group[]> {
        let params = new HttpParams();
        _.mapKeys(args, (value, key) => (params = params.set(key, value)));

        return this.http.get(`${this.workflowEndpointURL}/group`, { params }).pipe(
            map((groups: Group[]) => groups),
            catchError(this.handleError),
        );
    }

    createGroup(group: Group): Observable<any> {
        return this.http.post(`${this.workflowEndpointURL}/group`, { group }).pipe(
            map((response: Response) => response),
            catchError(this.handleError),
        );
    }

    updateGroup(group: Group): Observable<any> {
        return this.http.put(`${this.workflowEndpointURL}/group/${group.id}`, { group }).pipe(
            map((response: Response) => response),
            catchError(this.handleError),
        );
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }
}

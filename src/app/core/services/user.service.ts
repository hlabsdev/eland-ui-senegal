import { Injectable } from '@angular/core';
import { throwError as observableThrowError, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from '@app/core/models/user.model';
import { map, catchError } from 'rxjs/operators';
import { environment as config } from 'environments/environment';
import { AppAuthGuard } from '@app/core/utils/keycloak/app-auth-guard';

@Injectable()
export class UserService {
    private workflowEndpointURL = `${config.workflowApi}/engine-rest`;

    constructor(private http: HttpClient, public appAuthGuard: AppAuthGuard) {}

    getCurrentUser(): User {
        return this.appAuthGuard.getUser();
    }

    getAllUsers(): Observable<User[]> {
        return this.http.get(`${this.workflowEndpointURL}/user`).pipe(
            map((users: User[]) => users.map((usr) => new User(usr))),
            catchError(this.handleError),
        );
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }
}

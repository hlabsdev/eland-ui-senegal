import { Injectable } from '@angular/core';
import { environment as config } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { User } from '@app/core/models/user.model';

@Injectable()
export class KeycloakAdminService {
    private apiUrl = `${config.api}`;
    private keycloakUrl = `${this.apiUrl}/v1/keycloakAdmin`;

    constructor(private http: HttpClient) {}

    getUsers = () =>
        this.http.get<User[]>(`${this.keycloakUrl}/users/`).pipe(map((users) => users.map((user) => new User(user))));
    getUsersInvalidate = () => this.http.get(`${this.keycloakUrl}/users/invalidate`);
    getUsersUpdate = () => this.http.get(`${this.keycloakUrl}/users/update`);
}

import { throwError as observableThrowError, Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Config } from './config';
import { map, catchError, retry } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';

import { environment as config } from 'environments/environment';

@Injectable()
export class ConfigService {
    private endpointUrl = `${config.api}/v1`;
    private wfUrl = `${config.workflowApi}/engine-rest`;

    constructor(private http: HttpClient) {}

    getConfig(): Observable<Config> {
        return this.http.get(`${this.endpointUrl}/config`).pipe(
            map((c: Config) => c),
            catchError(this.handleError),
        );
    }

    updateConfig(appConfig: Config): Observable<Config> {
        // TODO: This is a placeholder, there no endpoint on the api for this.
        return this.http.put(`${this.endpointUrl}/config`, appConfig).pipe(
            map((response: any) => response),
            catchError(this.handleError),
        );
    }

    getPublicConfig(): Promise<any> {
        return this.http
            .get(`${this.endpointUrl}/config`)
            .pipe(
                map((c: Config) => this.setDefaultConfig(c)),
                catchError(this.handleError),
            )
            .toPromise();
    }

    getCamundaEngine(): Promise<any> {
        return this.http
            .get(`${this.wfUrl}/engine`)
            .pipe(
                map((response: any) => response),
                catchError(this.handleError),
            )
            .toPromise();
    }

    // set application level public config
    setDefaultConfig(defaults) {
        localStorage.setItem('defaults', JSON.stringify(defaults));
    }

    // get particular config value for a given key, else return null
    getDefaultConfig(key) {
        const defaults = JSON.parse(localStorage.getItem('defaults'));
        return _.get(defaults, key) ? _.get(defaults, key) : null;
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }
}

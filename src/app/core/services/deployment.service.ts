import { throwError as observableThrowError, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment as config } from 'environments/environment';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { Deployment } from '@app/core/models/deployment.model';

@Injectable()
export class DeploymentService {
    private workflowEndpointURL = `${config.workflowApi}/engine-rest`;

    constructor(private http: HttpClient) {}

    getDeployments(): Observable<Deployment[]> {
        return this.http.get<Deployment[]>(`${this.workflowEndpointURL}/deployment`).pipe(
            map((response) => response.map((d) => new Deployment(d))),
            catchError(this.handleError),
        );
    }

    getDeployment(deployment: Deployment): Observable<Deployment> {
        return this.http.get<Deployment>(`${this.workflowEndpointURL}/deployment/${deployment.id}`).pipe(
            map((response) => new Deployment(response)),
            catchError(this.handleError),
        );
    }

    getDeploymentById(deploymentId: string): Observable<Deployment> {
        return this.http.get<Deployment>(`${this.workflowEndpointURL}/deployment/${deploymentId}`).pipe(
            map((response) => new Deployment(response)),
            catchError(this.handleError),
        );
    }

    createDeployment(deployment): Observable<any> {
        const formData = new FormData();
        formData.append('deployment-name', deployment.name);

        deployment.files.forEach((file, index) => {
            formData.append('file' + index, file, file.name);
        });

        return this.http
            .post(`${this.workflowEndpointURL}/deployment/create`, formData)
            .pipe(catchError(this.handleError));
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }
}

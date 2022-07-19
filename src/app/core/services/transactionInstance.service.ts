import { throwError as observableThrowError, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment as config } from 'environments/environment';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { TransactionInstance } from '@app/core/models/transactionInstance.model';

@Injectable()
export class TransactionInstanceService {
    private endpointUrl = `${config.api}/v1`;

    constructor(private http: HttpClient) {}

    getTransactionInstances(): Observable<TransactionInstance[]> {
        return this.http.get<TransactionInstance[]>(`${this.endpointUrl}/transaction-instances`).pipe(
            map((response) => response.map((ti) => new TransactionInstance(ti))),
            catchError(this.handleError),
        );
    }

    getTransactionInstancesByWorkflowId(workflowId: string): Observable<TransactionInstance> {
        return this.http
            .get<TransactionInstance>(`${this.endpointUrl}/transaction-instances/workflow-id/${workflowId}`)
            .pipe(
                map((response) => new TransactionInstance(response)),

                catchError(this.handleError),
            );
    }

    addTransactionInstance(transactionInstance: TransactionInstance): Observable<any> {
        return this.http
            .post(`${this.endpointUrl}/transaction-instances`, transactionInstance)
            .pipe(catchError(this.handleError));
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }
}

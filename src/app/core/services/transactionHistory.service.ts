import { throwError as observableThrowError, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment as config } from 'environments/environment';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TransactionHistory } from '@app/core/models/transactionHistory.model';

@Injectable()
export class TransactionHistoryService {
    private workflowEndpointURL = `${config.workflowApi}/engine-rest`;

    constructor(private http: HttpClient) {}

    /**
     * catch error
     *
     * @param error
     */
    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }

    /**
     * get processes history
     *
     * @param stateType 'active' or 'completed'
     */
    getProcessInstancesHistory(stateFilter: string = null): Observable<TransactionHistory[]> {
        let params = new HttpParams();
        if (stateFilter) {
            params = params.set(stateFilter, 'true');
        }

        return this.http
            .get<TransactionHistory[]>(`${this.workflowEndpointURL}/history/process-instance`, { params })
            .pipe(
                map((response) => response.map((transactionHistory) => new TransactionHistory(transactionHistory))),
                catchError(this.handleError),
            );
    }

    /**
     * get list of completed transaction from history as a POST request
     */
    getCompletedProcessInstances(): Observable<TransactionHistory[]> {
        return this.http
            .post<TransactionHistory[]>(`${this.workflowEndpointURL}/history/process-instance`, { completed: true })
            .pipe(
                map((response) => response.map((transactionHistory) => new TransactionHistory(transactionHistory))),
                catchError(this.handleError),
            );
    }

    /**
     * get list of 'finished' transaction instances from history as a POST request
     * TODO: replace with method to getCompletedProcessInstances() when we update to Camunda v.7.9
     */
    getListOfFinishedInstances(): Observable<TransactionHistory[]> {
        return this.http
            .post<TransactionHistory[]>(`${this.workflowEndpointURL}/history/process-instance`, { finished: true })
            .pipe(
                map((response) =>
                    response
                        .filter((resp) => resp.state === 'COMPLETED')
                        .map((transactionHistory) => new TransactionHistory(transactionHistory)),
                ),
                catchError(this.handleError),
            );
    }

    /**
     * get process instance history
     *
     * @param id processInstanceId
     */
    getProcessInstanceHistory(id: string): Observable<TransactionHistory> {
        return this.http.get<TransactionHistory>(`${this.workflowEndpointURL}/history/process-instance/${id}`).pipe(
            map((response) => new TransactionHistory(response)),
            catchError(this.handleError),
        );
    }

    /**
     * Get process instance id of the root process instance that initiated the process
     *
     * @param processInstanceId
     */
    getRootProcessInstanceId(processInstanceId: string, isFastTrackProcess: boolean): Promise<string> {
        return new Promise((resolve, reject) => {
            if (isFastTrackProcess) {
                resolve(processInstanceId);
            } else {
                this.getProcessInstanceHistory(processInstanceId).subscribe((result) => {
                    if (result.superProcessInstanceId) {
                        this.getRootProcessInstanceId(result.superProcessInstanceId, isFastTrackProcess).then((id) =>
                            resolve(id),
                        );
                    } else {
                        resolve(processInstanceId);
                    }
                }, reject);
            }
        });
    }
}

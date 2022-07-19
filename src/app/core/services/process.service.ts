import { throwError as observableThrowError, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { environment as config } from 'environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Process } from '@app/core/models/process.model';
import { ProcessInstance } from '@app/core/models/processInstance.model';
import { ProcessXml } from '@app/core/models/processXml.model';
import { Variables, VariableValue } from '@app/core/models/variables.model';
import { Transaction } from '@app/core/models/transaction.model';
import { Count } from '@app/core/models/count.model';
import { ProcessStatistics } from '@app/core/models/processStatistics.model';
import Utils from '@app/core/utils/utils';
import * as _ from 'lodash';

@Injectable()
export class ProcessService {
    private workflowEndpointURL = `${config.workflowApi}/engine-rest`;

    constructor(private http: HttpClient) {}

    getProcesses(args: any = {}): Observable<Process[]> {
        let params = new HttpParams();
        _.mapKeys(args, (value, key) => (params = params.set(key, value)));

        return this.http.get<Process[]>(`${this.workflowEndpointURL}/process-definition`, { params }).pipe(
            map((response) => response.map((process) => new Process(process))),
            catchError(this.handleError),
        );
    }

    getProcess(process: Process): Observable<Process> {
        return this.http.get<Process>(`${this.workflowEndpointURL}/process-definition/${process.id}`).pipe(
            map((response) => new Process(response)),
            catchError(this.handleError),
        );
    }

    getProcessById(id: string): Observable<Process> {
        return this.http.get<Process>(`${this.workflowEndpointURL}/process-definition/${id}`).pipe(
            map((response) => new Process(response)),
            catchError(this.handleError),
        );
    }

    getProcessCount(args: any = {}): Observable<Count> {
        let params = new HttpParams();
        _.mapKeys(args, (value, key) => (params = params.set(key, value)));

        return this.http
            .get<Count>(`${this.workflowEndpointURL}/process-definition/count`, { params })
            .pipe(catchError(this.handleError));
    }

    getProcessStatistics(args: any = {}): Observable<ProcessStatistics[]> {
        let params = new HttpParams();
        _.mapKeys(args, (value, key) => (params = params.set(key, value)));

        return this.http
            .get<ProcessStatistics[]>(`${this.workflowEndpointURL}/process-definition/statistics`, { params })
            .pipe(catchError(this.handleError));
    }

    getProcessStatisticsByKey(processId: string, args: any = {}): Observable<ProcessStatistics[]> {
        let params = new HttpParams();
        _.mapKeys(args, (value, key) => (params = params.set(key, value)));

        return this.http
            .get<ProcessStatistics[]>(`${this.workflowEndpointURL}/process-definition/${processId}/statistics`, {
                params,
            })
            .pipe(catchError(this.handleError));
    }

    getProcessXml(process: Process): Observable<ProcessXml> {
        return this.http.get<ProcessXml>(`${this.workflowEndpointURL}/process-definition/${process.id}/xml`).pipe(
            map((response) => new ProcessXml(response)),
            catchError(this.handleError),
        );
    }

    getProcessDiagram(process: Process): any {
        return this.getProcessXml(process).pipe(
            map((response) => {
                const file: any = Utils.getFileMimeType(process.resource);
                return new Blob([response.bpmn20Xml], { type: file.type });
            }),
            catchError(this.handleError),
        );
    }

    getProcessXmlByKey(process: Process): Observable<ProcessXml> {
        return this.http.get<ProcessXml>(`${this.workflowEndpointURL}/process-definition/${process.id}/xml`).pipe(
            map((response) => new ProcessXml(response)),
            catchError(this.handleError),
        );
    }

    getStartForm(process: Process): Observable<any> {
        return this.http
            .get(`${this.workflowEndpointURL}/process-definition/key/${process.key}/startForm`)
            .pipe(catchError(this.handleError));
    }

    getStartFormById(id: string): Observable<any> {
        return this.http
            .get(`${this.workflowEndpointURL}/process-definition/${id}/startForm`)
            .pipe(catchError(this.handleError));
    }

    startProcess(process: Process, transaction: Transaction = new Transaction()): Observable<any> {
        const businessKey = transaction.id;
        return this.http
            .post(`${this.workflowEndpointURL}/process-definition/key/${process.key}/start`, {
                variables: transaction.initialContextObject,
                businessKey,
            })
            .pipe(catchError(this.handleError));
    }

    startProcessById(id: string, transaction: Transaction): Observable<ProcessInstance> {
        const businessKey = transaction.id;

        return this.http
            .post<ProcessInstance>(`${this.workflowEndpointURL}/process-definition/${id}/start`, {
                variables: transaction.initialContextObject,
                businessKey,
            })
            .pipe(
                map((response) => new ProcessInstance(response)),
                catchError(this.handleError),
            );
    }

    // TODO: Why this retourns variables ?
    getInstanceCount(): Observable<Variables> {
        return this.http.get<Variables>(`${this.workflowEndpointURL}/process-instance/count`).pipe(
            map((response) => new Variables(response)),
            catchError(this.handleError),
        );
    }

    getInstanceCountPost(body: any = {}, args: any = {}): Observable<Count> {
        let params = new HttpParams();
        _.mapKeys(args, (value, key) => (params = params.set(key, value)));

        return this.http
            .post<Count>(`${this.workflowEndpointURL}/process-instance/count`, body, { params })
            .pipe(catchError(this.handleError));
    }

    getInstances(instanceIds: string = null): Observable<ProcessInstance[]> {
        const params = new HttpParams();
        if (instanceIds) {
            params.set('processInstanceIds', instanceIds);
        }

        return this.http.get<ProcessInstance[]>(`${this.workflowEndpointURL}/process-instance`, { params }).pipe(
            map((response) => response.map((process) => new ProcessInstance(process))),
            catchError(this.handleError),
        );
    }

    getInstance(args: any = {}): Observable<Variables> {
        const { id } = args;
        return this.http.get<Variables>(`${this.workflowEndpointURL}/process-instance/${id}`).pipe(
            map((response) => new Variables(response)),
            catchError(this.handleError),
        );
    }

    // TODO: Move to a history
    getInstanceHistory(id: string): Observable<Variables> {
        return this.http.get<Variables>(`${this.workflowEndpointURL}/history/process-instance/${id}`).pipe(
            map((response) => new Variables(response)),
            catchError(this.handleError),
        );
    }

    // TODO: Move to a variables services, and create a generic service that accepts params
    getInstanceVariables(instance: ProcessInstance): Observable<Variables> {
        return this.http
            .get<Variables>(
                `${this.workflowEndpointURL}/process-instance/${instance.id}/variables?deserializeValues=false`,
            )
            .pipe(
                map((response) => new Variables(response)),
                catchError(this.handleError),
            );
    }

    getInstanceVariable(instance: ProcessInstance, varName: string): Observable<Variables> {
        return this.http
            .get<Variables>(`${this.workflowEndpointURL}/process-instance/${instance.id}/variables/${varName}`)
            .pipe(
                map((response) => new Variables(response)),
                catchError(this.handleError),
            );
    }

    /**
     * Store a new variable in the process instance as String
     *
     * @param processInstanceId
     * @param variableName
     * @param value
     */
    putInstanceVariableAsString(processInstanceId: string, variableName: string, value: string): Observable<any> {
        return this.putInstanceVariable(processInstanceId, variableName, new VariableValue({ value, type: 'String' }));
    }

    putInstanceVariable(processInstanceId: string, variableName: string, value: VariableValue): Observable<any> {
        return this.http
            .put(`${this.workflowEndpointURL}/process-instance/${processInstanceId}/variables/${variableName}`, value)
            .pipe(catchError(this.handleError));
    }

    deleteInstance(instance: ProcessInstance) {
        return this.http
            .delete(`${this.workflowEndpointURL}/process-instance/${instance.id}`)
            .pipe(catchError(this.handleError));
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }

    /**
     * get process-instance variables by instance id
     *
     * @param instanceId
     */
    getInstanceVariablesByProcessInstanceId(instanceId: string): Observable<Variables[]> {
        return this.http
            .get<Variables[]>(
                `${this.workflowEndpointURL}/process-instance/${instanceId}/variables?deserializeValues=false`,
            )
            .pipe(catchError(this.handleError));
    }

    /**
     * get process-instance comments by instance id and variable name
     *
     * @param instanceId
     */
    getInstanceVariableDeserialized(instanceId: string, variableName: string): Observable<Variables> {
        return this.http
            .get<Variables>(
                `${this.workflowEndpointURL}/process-instance/${instanceId}/variables/${variableName}?deserializeValue=false`,
            )
            .pipe(catchError(this.handleError));
    }

    /**
     * store new task comment
     *
     * @param processInstanceId
     * @param variableName
     * @param values
     */
    putInstanceVariableJson(processInstanceId: string, values: any, variableName: string): Observable<any> {
        return this.putInstanceVariable(
            processInstanceId,
            variableName,
            new VariableValue({ value: JSON.stringify(values), type: 'Json' }),
        );
    }

    // get task count by post req.body & params.
    getProcessInstancesHistoryRequestBodyCount(args: any = {}): Observable<number> {
        const { query, requestBody } = args;
        const params = this.buildQuery({ query });

        return this.http
            .post<number>(`${this.workflowEndpointURL}/history/process-instance/count`, requestBody, params)
            .pipe(
                map((response: any) => response.count),
                catchError(this.handleError),
            );
    }

    getProcessInstancesHistoryRequestBody(args: any = {}): Observable<ProcessInstance[]> {
        const { query, requestBody } = args;
        const params = this.buildQuery({ query });

        return this.http
            .post<ProcessInstance[]>(`${this.workflowEndpointURL}/history/process-instance`, requestBody, params)
            .pipe(
                map((response: any) => response.map((p) => new ProcessInstance(p))),
                catchError(this.handleError),
            );
    }

    buildQuery(args: any = {}): any {
        const { orQuery, query, processDefinitionId, nameLike, sorting } = args;
        let params = new HttpParams();

        if (query) {
            _.mapKeys(query, (value, key) => (params = params.set(key, value)));
        }

        // remove falsy values.
        const requestBody = _.pickBy(
            {
                orQueries: orQuery && [...orQuery],
                processDefinitionId,
                nameLike: nameLike ? `%${nameLike}%` : null,
                sorting,
            },
            _.identity,
        );

        return { requestBody, params };
    }
}

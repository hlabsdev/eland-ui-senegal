import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment as config } from 'environments/environment';
import * as _ from 'lodash';
import { Observable, throwError as observableThrowError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Task } from '@app/core/models/task.model';
import { TaskComment } from '@app/core/models/taskComment.model';
import { User } from '@app/core/models/user.model';
import { Variables, VariableValue } from '@app/core/models/variables.model';
import { Registry } from '@app/core/models/registry.model';

@Injectable()
export class TaskService {
    private workflowUrl = `${config.workflowApi}/engine-rest`;

    constructor(private http: HttpClient) {}

    getTask(task: Task): Observable<Task> {
        return this.http.get<Task>(`${this.workflowUrl}/task/${task.id}`).pipe(
            map((response) => new Task(response)),
            catchError(this.handleError),
        );
    }
    getTaskById(taskId: string): Observable<Task> {
        return this.http.get<Task>(`${this.workflowUrl}/task/${taskId}`).pipe(
            map((response) => new Task(response)),
            catchError(this.handleError),
        );
    }

    // TODO Move to a variables services, and create a generic service that accepts params
    getTaskVariables(task: Task): Observable<Variables> {
        return this.http.get<Variables>(`${this.workflowUrl}/task/${task.id}/variables?deserializeValues=false`).pipe(
            map((response) => new Variables(response)),
            catchError(this.handleError),
        );
    }

    getTaskVariable(task: Task, varName: string): Observable<any> {
        return this.http
            .get(`${this.workflowUrl}/task/${task.id}/variables/${varName}`)
            .pipe(catchError(this.handleError));
    }

    putTaskVariable(task: Task, varName: string, value: VariableValue = null): Observable<any> {
        return this.http
            .put(`${this.workflowUrl}/task/${task.id}/variables/${varName}`, value)
            .pipe(catchError(this.handleError));
    }

    // Postponing the refactoring until Camunda 7.14
    putTaskVariables(task: Task, values: { val: any; variable: any } = null): Observable<any> {
        return this.http
            .put(`${this.workflowUrl}/task/${task.id}/variables`, values)
            .pipe(catchError(this.handleError));
    }

    completeTask(task: Task, variables: Variables = {}): Observable<any> {
        return this.http
            .post(`${this.workflowUrl}/task/${task.id}/complete`, { variables })
            .pipe(catchError(this.handleError));
    }

    getTaskIdentityLink(task: Task): Observable<any> {
        return this.http.get(`${this.workflowUrl}/task/${task.id}/identity-links`).pipe(catchError(this.handleError));
    }

    getTasks(query = {}): Observable<Task[]> {
        const { params } = this.buildQuery({ query });
        return this.http.get<Task[]>(`${this.workflowUrl}/task`, { params }).pipe(
            map((response) => response.map((tsk) => new Task(tsk))),
            catchError(this.handleError),
        );
    }

    getAllTasks(): Observable<Task[]> {
        return this.getTasks();
    }

    getCandidateTasksByGroup(groupId): Observable<Task[]> {
        return this.getTasks({ candidateGroup: groupId });
    }

    getCandidateTasksByGroups(groupnames): Observable<Task[]> {
        return this.getTasks({ candidateGroups: groupnames });
    }

    getCandidateTasksByUser(userId): Observable<Task[]> {
        return this.getTasks({ candidateUser: userId });
    }

    getMyTasks(user: User): Observable<Task[]> {
        return this.getTasks({ assignee: user.username });
    }

    getTaskByWorkflowProcessInstanceId(workflowProcessInstanceId): Observable<Task[]> {
        return this.getTasks({ processInstanceId: workflowProcessInstanceId });
    }

    reclaim(task: Task, user: User): Observable<any> {
        return this.http.post(`${this.workflowUrl}/task/${task.id}/unclaim`, {}).pipe(
            switchMap((tsk) => this.claimTask(task, user)),
            catchError(this.handleError),
        );
    }

    claimTask(task: Task, user: User): Observable<any> {
        return this.http
            .post(`${this.workflowUrl}/task/${task.id}/claim`, { userId: user.username })
            .pipe(catchError(this.handleError));
    }

    unclaimTask(task: Task): Observable<any> {
        return this.http.post(`${this.workflowUrl}/task/${task.id}/unclaim`, {}).pipe(catchError(this.handleError));
    }

    getAllTaskComments(taskId: string): Observable<TaskComment[]> {
        return this.http.get<TaskComment[]>(`${this.workflowUrl}/task/${taskId}/comment`).pipe(
            map((response) => response.map((taskComment) => new TaskComment(taskComment))),
            catchError(this.handleError),
        );
    }

    getTaskComment(task: Task, taskComment: TaskComment): Observable<TaskComment> {
        return this.http.get<TaskComment>(`${this.workflowUrl}/task/${task.id}/comment/${taskComment.id}`).pipe(
            map((response) => new TaskComment(response)),
            catchError(this.handleError),
        );
    }

    createTaskComment(task: Task, taskComment: TaskComment): Observable<any> {
        return this.http
            .post(`${this.workflowUrl}/task/${task.id}/comment/create`, { message: taskComment.message })
            .pipe(catchError(this.handleError));
    }

    setAssignee(taskId: string, username: string): Observable<any> {
        return this.http
            .post(`${this.workflowUrl}/task/${taskId}/assignee`, { userId: username })
            .pipe(catchError(this.handleError));
    }

    deleteTaskVariable(task: Task, varName: string): Observable<any> {
        return this.http
            .delete(`${this.workflowUrl}/task/${task.id}/variables/${varName}`)
            .pipe(catchError(this.handleError));
    }

    getTaskHistory(task: Task): Observable<Task[]> {
        return (
            this.http
                // TODO: Create a generic call with params
                // eslint-disable-next-line max-len
                .get<Task[]>(
                    `${this.workflowUrl}/history/task?processInstanceId=${task.processInstanceId}&taskDefinitionKey=${task.taskDefinitionKey}&taskDeleteReason=completed&sortBy=startTime&sortOrder=desc`,
                )
                .pipe(
                    map((response) => response.map((taskObj) => new Task(taskObj))),
                    catchError(this.handleError),
                )
        );
    }

    getTasksFromHistory(processInstanceId: string = null, taskInvolvedGroup: string = null): Observable<Task[]> {
        const params = {
            processInstanceId,
            taskInvolvedGroup,
            sortOrder: 'desc',
            sortBy: 'endTime',
        };
        return this.http.post<Task[]>(`${this.workflowUrl}/history/task`, params).pipe(
            map((response) => response.map((tsk) => new Task(tsk))),
            catchError(this.handleError),
        );
    }

    updateTaskOwner(task: Task, owner: string = null): Observable<any> {
        return this.http.put(`${this.workflowUrl}/task/${task.id}/`, { owner }).pipe(catchError(this.handleError));
    }

    // TODO: Find a more efficient call
    getCurrentTask(processInstanceId: string): Observable<Task> {
        return this.http.get<Task[]>(`${this.workflowUrl}/task?processInstanceId=${processInstanceId}`).pipe(
            map((response) => new Task(response[0])),
            catchError(this.handleError),
        );
    }

    // get task list by post req.body & params.
    getTasksRequestBody(args: any = {}): Observable<Task[]> {
        const { query, requestBody } = args;
        const params = this.buildQuery({ query });

        return this.http.post<Task[]>(`${this.workflowUrl}/task`, requestBody, params).pipe(
            map((response: any) => response.map((tsk) => new Task(tsk))),
            catchError(this.handleError),
        );
    }

    // get task count by post req.body & params.
    getTasksRequestBodyCount(args: any = {}): Observable<number> {
        const { query, requestBody } = args;
        const params = this.buildQuery({ query });

        return this.http.post<number>(`${this.workflowUrl}/task/count`, requestBody, params).pipe(
            map((response: any) => response.count),
            catchError(this.handleError),
        );
    }

    buildQuery(args: any = {}): any {
        const {
            orQuery,
            query,
            processDefinitionId,
            nameLike,
            sorting,
            processVariables,
            assignee,
            candidateGroups,
            includeAssignedTasks,
        } = args;
        let params = new HttpParams();

        if (query) {
            _.mapKeys(query, (value, key) => (params = params.set(key, value)));
        }

        // remove falsy values.
        const requestBody = _.pickBy(
            {
                orQueries: orQuery && [...orQuery],
                processDefinitionId,
                processVariables,
                nameLike: nameLike ? `%${nameLike}%` : null,
                sorting,
                assignee,
                candidateGroups,
                includeAssignedTasks,
            },
            _.identity,
        );

        return { requestBody, params };
    }

    generateRegistryFilter(registries: Registry[] = []): any {
        const condition = registries.map((registry) => ({
            name: 'titleNumber',
            operator: 'like',
            value: '%' + registry.code,
        }));

        // Processes without a commune assigned
        condition.push({
            name: 'titleNumber',
            operator: 'eq',
            value: '',
        });

        return {
            orQueries: [
                {
                    processVariables: condition,
                },
            ],
        };
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }

    getTaskGroupCount() {
        return this.http.get<any>(`${this.workflowUrl}/task/report/candidate-group-count`).pipe(
            map((response: any) => response),
            catchError(this.handleError),
        );
    }
}

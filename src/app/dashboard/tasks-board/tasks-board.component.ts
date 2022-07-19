import { Component, OnInit, ViewChild } from '@angular/core';
import { TaskService } from '@app/core/services/task.service';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { UtilService } from '@app/core/utils/util.service';
import { RowSizes } from '@app/core/models/rowSize.model';
import { Task } from '@app/core/models/task.model';
import * as _ from 'lodash';
import { Table } from 'primeng/table';

@Component({
    selector: 'app-tasks-board',
    templateUrl: './tasks-board.component.html',
})
export class TasksBoardComponent implements OnInit {
    @ViewChild('taskTable') taskTable: Table;

    tasksCount: any = [];

    groupAndTasks: any = [];

    tasksFilters = {
        sort: {
            sortBy: 'startTime',
            sortOrder: 'desc',
        },
        assigned: {
            assigned: true,
            unfinished: true,
        },
        assignedToGroup: {
            unassigned: true,
            unfinished: true,
            withCandidateGroups: true,
        },
        unassigned: {
            unassigned: true,
            unfinished: true,
            withoutCandidateGroups: true,
        },
        byGroup: {
            unfinished: true,
        },
    };

    rowSizes: any = RowSizes;
    tasks: Task[] = [];
    totalRecords: number;
    taskName;
    assigneeLike;
    defaultSelection = 'assigned';
    taskHadCandidateGroup;
    groupSelection;
    selectedTask: Task = null;
    clonedTasks = {};

    constructor(
        private taskService: TaskService,
        private utilService: UtilService,
        private alertService: AlertService,
    ) {}

    ngOnInit() {
        this.getTasksCount();
        this.getTaskAssignedByGroup();
        this.getTasks({ count: true });
    }

    getTasksCount() {
        const assignedToUser$ = this.taskService
            .getTasksRequestBodyCount({
                requestBody: this.tasksFilters.assigned,
            })
            .toPromise();
        const assignedToOneOrMoreGroup$ = this.taskService
            .getTasksRequestBodyCount({
                requestBody: this.tasksFilters.assignedToGroup,
            })
            .toPromise();
        const unassigned$ = this.taskService
            .getTasksRequestBodyCount({
                requestBody: this.tasksFilters.unassigned,
            })
            .toPromise();

        return Promise.all([assignedToUser$, assignedToOneOrMoreGroup$, unassigned$])
            .then((data) => {
                this.tasksCount = [
                    {
                        name: 'assigned',
                        value: 'COMMON.ACTIONS.TASK_TAKEN',
                        count: data[0],
                    },
                    {
                        name: 'assignedToGroup',
                        value: 'HEADER.GROUP_TASKS',
                        count: data[1],
                    },
                    {
                        name: 'unassigned',
                        value: 'HEADER.UNASSIGNED',
                        count: data[2],
                    },
                ];
            })
            .catch((err) => this.alertService.camundaError(err));
    }

    getTaskAssignedByGroup() {
        this.taskService
            .getTaskGroupCount()
            .toPromise()
            .then((val) => {
                this.groupAndTasks = val;
            })
            .catch((err) => this.alertService.camundaError(err));
    }

    getTasks(args: any = {}) {
        const { name = this.defaultSelection, filters = {}, candidateGroup, count, reset } = args;

        if (reset && this.taskTable) {
            this.taskTable.reset();
        }

        this.defaultSelection = name;

        const query = {
            firstResult: filters.first || 0,
            maxResults: filters.rows || this.rowSizes.SMALL,
        };

        const search = _.pickBy(
            {
                nameLike: this.taskName ? `%${this.taskName}%` : null,
                assigneeLike: this.assigneeLike ? `%${this.assigneeLike}%` : null,
                candidateGroup: candidateGroup ? candidateGroup : null,
            },
            _.identity,
        );

        const requestBody = { ...this.tasksFilters[name], ...search };

        const count$ = count
            ? this.taskService
                  .getTasksRequestBodyCount({
                      requestBody,
                  })
                  .toPromise()
            : Promise.resolve(null);

        const tasks$ = this.taskService
            .getTasksRequestBody({
                requestBody,
                query,
            })
            .toPromise();

        return Promise.all([count$, tasks$])
            .then(([totalRecords, tasks]) => {
                this.tasks = tasks;
                if (totalRecords) {
                    this.totalRecords = totalRecords;
                }
            })
            .catch((err) => this.alertService.camundaError(err));
    }

    onRowEditInit(task: Task) {
        this.clonedTasks[task.id] = { ...task };
    }

    onRowEditSave(task: Task, index) {
        const requestBody = { assignee: task.assignee };

        if (task.assignee) {
            // assign.
            return this.taskService
                .getTasksRequestBodyCount({ requestBody })
                .toPromise()
                .then((count) => {
                    this.utilService.displayConfirmationDialogWithMessageParameters(
                        'MESSAGES.CONFIRM_TASK_ASSIGN',
                        { name: task.assignee, count },
                        () => {
                            this.taskService
                                .setAssignee(task.id, task.assignee)
                                .toPromise()
                                .then((val) => {
                                    delete this.clonedTasks[task.id];
                                });
                        },
                        () => {
                            this.onRowEditCancel(task, index);
                        },
                    );
                });
        } else {
            // unassign.
            return this.utilService.displayConfirmationDialog(
                'MESSAGES.CONFIRM',
                () => {
                    this.taskService
                        .unclaimTask(task)
                        .toPromise()
                        .then((val) => {
                            delete this.clonedTasks[task.id];
                        });
                },
                () => {
                    this.onRowEditCancel(task, index);
                },
            );
        }
    }

    onRowEditCancel(task: Task, index: number) {
        this.tasks[index] = this.clonedTasks[task.id];
        delete this.clonedTasks[task.id];
    }
}

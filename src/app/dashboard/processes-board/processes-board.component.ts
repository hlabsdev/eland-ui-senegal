import { Component, OnInit } from '@angular/core';
import { TaskService } from '@app/core/services/task.service';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { ProcessService } from '@app/core/services/process.service';
import { ValidationService } from '@app/core/utils/validation.service';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
    templateUrl: './processes-board.component.html',
})
export class ProcessesBoardComponent implements OnInit {
    processStats: {
        id: string;
        name: string;
        instances: number;
        failedJobs: number;
        incidents: number;
    }[];

    processCount: number;
    searchResult: any[] = [];

    query: any;

    constructor(
        private taskService: TaskService,
        public router: Router,
        private processService: ProcessService,
        private translateService: TranslateService,
        private alertService: AlertService,
        public validationService: ValidationService,
        private processHistoryService: ProcessService,
    ) {}

    ngOnInit() {
        this.getProcesses();
    }

    getProcesses(args: any = {}) {
        const processCount$ = this.processService.getProcessCount({ latest: true }).toPromise();
        const processStatistics$ = this.processService.getProcessStatistics({ incidents: true }).toPromise();
        const latestProcesses$ = this.processService.getProcesses({ latestVersion: true }).toPromise();

        return Promise.all([processCount$, processStatistics$, latestProcesses$]).then(
            ([processCount, processesStatistics, latestProcesses]) => {
                this.processCount = processCount.count;
                const stats = _(processesStatistics)
                    .groupBy('definition.key')
                    .map((statsByKey, key) => ({
                        key,
                        instances: _.sumBy(statsByKey, 'instances'),
                        failedJobs: _.sumBy(statsByKey, 'failedJobs'),
                        incidents: _.sumBy(_.flatMap(statsByKey, 'incidents'), 'incidentCount'),
                    }))
                    .value();

                this.processStats = latestProcesses.map((process) => {
                    const processStat = stats.find((s) => s.key === process.key);

                    return {
                        id: process.id,
                        name: process.name,
                        instances: processStat.instances,
                        failedJobs: processStat.failedJobs,
                        incidents: processStat.incidents,
                    };
                });
            },
        );
    }

    async search(form: NgForm) {
        if (form.invalid) {
            const errorResult = this.validationService.validateForm(form);
            return this.alertService.error(errorResult.message);
        }

        this.searchResult = [];

        const [key, value] = this.query.split(':');

        const requestBody = {
            variables: [{ name: key, operator: 'eq', value }],
            sortBy: 'startTime',
            sortOrder: 'desc',
        };

        const processInstances = await this.processHistoryService
            .getProcessInstancesHistoryRequestBody({ requestBody })
            .toPromise();

        processInstances.forEach((processInstance) => {
            this.taskService
                .getTasksRequestBody({ requestBody: { processInstanceId: processInstance.id } })
                .subscribe((tasks) => {
                    this.searchResult.push(
                        _.assign(processInstance, {
                            assignee: tasks
                                .map((t) => t.assignee || this.translateService.instant('HEADER.UNASSIGNED'))
                                .join(', '),
                        }),
                    );
                });
        });
    }
}

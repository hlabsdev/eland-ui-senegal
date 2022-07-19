import { Component, OnInit } from '@angular/core';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { ProcessService } from '@app/core/services/process.service';
import { Process } from '@app/core/models/process.model';
import { ProcessXml } from '@app/core/models/processXml.model';
import { SelectItem } from 'primeng/api';
import * as _ from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    templateUrl: './process-definition.component.html',
})
export class ProcessDefinitionComponent implements OnInit {
    instancesRunningAllVersions: number;
    instancesRunningCurrentVersion: number;
    processVersions: SelectItem[];
    process: Process;
    processXml: ProcessXml;
    processStatistics: any[];
    currentProcessId: string;

    constructor(
        public router: Router,
        protected route: ActivatedRoute,
        private processService: ProcessService,
        private alertService: AlertService,
    ) {}

    ngOnInit() {
        this.route.params.subscribe((params) => {
            this.getProcesses(params.processId);
        });
    }

    async getProcesses(processId) {
        this.processXml = null;

        this.process = await this.processService
            .getProcess(new Process({ id: processId, sortBy: 'version', sortOrder: 'desc', withoutTenantId: true }))
            .toPromise();
        this.currentProcessId = this.process.id;
        const allVersionsCount$ = this.processService
            .getInstanceCountPost({ processDefinitionKey: this.process.key, withoutTenantId: true })
            .toPromise();
        const currentVersionCount$ = this.processService
            .getInstanceCountPost({ processDefinitionId: this.process.id, withoutTenantId: true })
            .toPromise();
        const processVersions$ = this.processService
            .getProcesses({ key: this.process.key, sortBy: 'version', sortOrder: 'desc' })
            .toPromise();
        const getProcessStatisticsByKey$ = this.processService
            .getProcessStatisticsByKey(this.process.id, { incidents: true })
            .toPromise();
        const getProcessXml$ = this.processService.getProcessXml(new Process({ id: this.process.id })).toPromise();

        return Promise.all([
            processVersions$,
            getProcessStatisticsByKey$,
            allVersionsCount$,
            currentVersionCount$,
            getProcessXml$,
        ]).then(
            ([
                processVersions,
                processStatistics,
                instancesRunningAllVersions,
                instancesRunningCurrentVersion,
                processXml,
            ]) => {
                this.instancesRunningAllVersions = instancesRunningAllVersions.count;
                this.instancesRunningCurrentVersion = instancesRunningCurrentVersion.count;
                this.processVersions = processVersions.map((pv) => pv.toSelectItem({ label: pv.version }));
                this.processXml = processXml;
                this.processStatistics = processStatistics;
            },
        );
    }

    loadDiagram(currentProcessId) {
        this.processXml = null;

        this.processService.getProcessXml(new Process({ id: currentProcessId })).subscribe(
            (processXml) => (this.processXml = processXml),
            (err) => this.alertService.camundaError(err),
        );
    }

    displaySelectedProcess() {
        this.router.navigate(['/dashboard/processes', this.currentProcessId]);
    }
}

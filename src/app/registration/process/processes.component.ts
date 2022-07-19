import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { Process } from '@app/core/models/process.model';
import { ProcessInstance } from '@app/core/models/processInstance.model';
import { RowSizes } from '@app/core/models/rowSize.model';
import { Transaction } from '@app/core/models/transaction.model';
import { TransactionInstance } from '@app/core/models/transactionInstance.model';
import { DeploymentService } from '@app/core/services/deployment.service';
import { ProcessService } from '@app/core/services/process.service';
import { TransactionInstanceService } from '@app/core/services/transactionInstance.service';
import { ErrorResult } from '@app/core/utils/models/errorResult.model';
import { LocaleDatePipe } from '@app/core/utils/localeDate.pipe';
import { UtilService } from '@app/core/utils/util.service';
import { ValidationService } from '@app/core/utils/validation.service';
import { TranslateService } from '@ngx-translate/core';
import WorkFlowUtils from '@app/core/utils/workflow.utils';
import BpmnModdle from 'bpmn-moddle';
import * as _ from 'lodash';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { forkJoin, from } from 'rxjs';
import { map, mergeMap, switchMap, tap, toArray } from 'rxjs/operators';
import * as saveAs from 'file-saver';
import { TableConfig } from '@app/core/models/tableConfig';
import { TableCols } from '@app/core/models/tableCols';

@Component({
    selector: 'app-processes',
    templateUrl: './processes.component.html',
    styleUrls: ['./processes.component.scss'],
    providers: [LocaleDatePipe],
})
export class ProcessesComponent implements OnInit {
    instance: ProcessInstance;
    processes: Process[];
    rowSizes: any = RowSizes;
    deployment: any;
    displayUploader: boolean;
    errorMessage: string;
    bpmModdle = new BpmnModdle();
    @Input() isPopup:boolean;
    @Output() selectedProcess = new EventEmitter();
    @Output() unSelectedProcess = new EventEmitter();

    @ViewChild('form') form: NgForm;

    // preloader message
    preloaderMessage = '...';

    tableConfig: TableConfig = {
        title: this.translateService.instant('TASK.PROCESS'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'process',
        displayAction: true,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: false,
        enableReload: true,
        addBtn: true,
        searchBarField: ['name', 'deploymentName', 'key', 'resource', 'version', 'deploymentDate'],
        actions: [{
            type: 'download',
            callback: 'downloadBPNMFile',
        }]
    }

    cols: TableCols[] = [];

    constructor(
        private translateService: TranslateService,
        private processService: ProcessService,
        private transactionInstanceService: TransactionInstanceService,
        private deploymentService: DeploymentService,
        private validationService: ValidationService,
        private alertService: AlertService,
        private datePipe: LocaleDatePipe,
        private utils: UtilService,
        private router: Router,
        private ngxLoader: NgxUiLoaderService,
    ) {}

    ngOnInit(): void {
        this.cols = [
            { field: 'key', header: this.translateService.instant('PROCESS.KEY'), sortable: true, filterable: false, type: 'text'},
            { field: 'deploymentName', header: this.translateService.instant('DEPLOYMENT.NAME'), sortable: true, filterable: false, type: 'text' },
            { field: 'resource', header: this.translateService.instant('PROCESS.RESOURCE'), sortable: true, filterable: false, type: 'text' },
            { field: 'version', header: this.translateService.instant('PROCESS.VERSION'), sortable: true, filterable: false, type: 'text' },
            { field: 'deploymentDate', header: this.translateService.instant('DEPLOYMENT.DEPLOYMENT_DATE'), sortable: true, filterable: false, type: 'date' }
        ];
        //Réduction des colonnes pour une affichage responsive dans les popups
        if(!this.isPopup)
        {
            this.cols.unshift({ field: 'name', header: this.translateService.instant('PROCESS.NAME'), sortable: true, filterable: true, type: 'text' })
            this.tableConfig.enableExport=true;
        }
        this.setDefaultDeploymentName();
        this.loadProcesses();
    }

    setDefaultDeploymentName() {
        const deploymentName = this.translateService.instant('DEPLOYMENT.NEW');
        this.deployment = { name: `${deploymentName} ${this.datePipe.transform(new Date())}`, files: [] };
    }

    loadProcesses() {
        this.processService
            .getProcesses({ latestVersion: true })
            .pipe(
                switchMap((processes) => from(processes)),
                mergeMap((process: Process) =>
                    forkJoin([this.deploymentService.getDeploymentById(process.deploymentId)]).pipe(
                        map((data) => ({ process, deploymentId: data[0] })),
                    ),
                ),
            )
            .pipe(tap((data: any) => (data.process.deploymentName = data.deploymentId.name)))
            .pipe(tap((data: any) => (data.process.deploymentDate = data.deploymentId.deploymentTime)))
            // need to insert a translation function to translate the date to the format we use
            .pipe(map((data: any) => data.process))
            .pipe(toArray())
            .subscribe(
                (processes) => {
                    // preloading
                    this.ngxLoader.start();

                    this.processes = processes;

                    // setting the preloader message
                    this.preloaderMessage = this.getPreloaderMessage();

                    // stopping the preloading
                    this.ngxLoader.stop();

                    
                },
                (err) => this.alertService.camundaError(err),
            );
    }

    getPreloaderMessage() {
        if (this.processes.length === 0) {
            return '...';
        } else if (this.processes.length === 1) {
            return (
                this.translateService.instant('PRELOADER.ONE_MOMENT') +
                ', ' +
                this.processes.length +
                ' ' +
                this.translateService.instant('PRELOADER.PROCESS') +
                ' ' +
                this.translateService.instant('PRELOADER.IS_LOADING') +
                '.'
            );
        } else {
            return (
                this.translateService.instant('PRELOADER.ONE_MOMENT') +
                ', ' +
                this.processes.length +
                ' ' +
                this.translateService.instant('PRELOADER.PROCESSES') +
                ' ' +
                this.translateService.instant('PRELOADER.ARE_LOADING') +
                '.'
            );
        }
    }

    add(): void {
        this.router.navigate(['deployment']);
    }

    start(process: Process): void {
        this.instance = null;

        this.processService.getStartForm(process).subscribe(
            (startForm) => {
                if (startForm.key) {
                    return this.alertService.warning('MESSAGES.START_PROCESS_NEEDS_FORM');
                }

                this.processService.startProcess(process).subscribe(
                    (instance) => {
                        if (!instance) {
                            return this.alertService.error('MESSAGES.START_PROCESS_FAILED');
                        }

                        this.instance = new ProcessInstance(instance);

                        const transactionInstance = new TransactionInstance();

                        transactionInstance.transaction = new Transaction({
                            id: '35e6173c-37bc-4800-bed1-2b236fd86bf7',
                            name: 'grantOfFreehold',
                            workflowProcessId: 'grantOfFreehold:14:68b9483a-8377-11e8-b8cb-0242ac110002',
                            initialContext: '{}',
                        });

                        transactionInstance.workflowProcessInstanceId = instance.id;

                        this.transactionInstanceService.addTransactionInstance(transactionInstance).subscribe(
                            (result) => {
                                this.alertService.success('MESSAGES.START_PROCESS_SUCCESS');
                            },
                            (err) => {
                                if (this.instance) {
                                    this.delete(this.instance);
                                }

                                this.alertService.camundaError(err);
                            },
                        );
                    },
                    (err) => this.alertService.camundaError(err),
                );
            },
            (err) => this.alertService.camundaError(err),
        );
    }

    delete(instance) {
        this.processService.deleteInstance(instance).subscribe(
            (val) => {},
            (err) => this.alertService.camundaError(err),
        );
    }

    refresh() {
        this.loadProcesses();
        this.resetDeployment();
        this.alertService.success('MESSAGES.CONTENT_REFRESHED');
    }

    addFiles(event) {
        this.deployment.files = event.files;
    }

    save(form: NgForm) {
        this.errorMessage = null;

        if (form.invalid || _.isEmpty(this.deployment.files)) {
            if (_.isEmpty(this.deployment.files)) {
                return (this.errorMessage = new ErrorResult('MESSAGES.FILE_UPLOAD_MANDATORY').toMessage());
            }
            const errorResult = this.validationService.validateForm(form);
            return (this.errorMessage = errorResult.toMessage());
        }

        WorkFlowUtils.validateBpmnFiles(this.deployment.files).subscribe(
            (invalidForms) => {
                if (!_.isEmpty(invalidForms)) {
                    return (this.errorMessage = new ErrorResult('MESSAGES.FORM_KEY_ERROR', {
                        parameter: invalidForms,
                    }).toMessage());
                }

                this.deploymentService.createDeployment(this.deployment).subscribe(
                    () => {
                        this.alertService.success('MESSAGES.PROCESS_DEPLOYED');
                        this.refresh();
                        this.displayUploader=false;
                    },
                    (error) => this.alertService.camundaError(error),
                );
            },
            (error) => {
                this.errorMessage = error.toMessage();
            },
        );
    }

    resetDeployment() {
        this.errorMessage = null;
        this.displayUploader = false;
        if (this.form) {
            this.form.reset();
        }
        this.setDefaultDeploymentName();
        this.displayUploader = false;
    }

    downloadBPNMFile(process: Process): void {
        const fileName = process.resource;
        this.processService.getProcessDiagram(process).subscribe((val) => saveAs(val, fileName));
    }
    /**
     *  activity event toggles on tasklist-categorize buttons   
     */
    onRowSelect(event) {
        console.log(event.data);
        this.selectedProcess.emit(event.data);
    }

    onRowUnselect(event) {
        console.log(event.data);
        this.unSelectedProcess.emit(null);
    }

    selectedRow(event) {
        console.log(event);
    }
    reload(){
        this.loadProcesses();
      
    }
    call($event){
        var fn = $event[0];
        this[fn]($event[1]);
        var rowData = $event[1];
        if (fn=="editFn")
        {
           this.editFn(rowData)
        }
    }
    /**
     * used to download the process
     * @param item 
     */
    editFn(item){
        this.downloadBPNMFile(item);
    }
    addProcess(){
        this.displayUploader=true;
        this.setDefaultDeploymentName();
    }
}

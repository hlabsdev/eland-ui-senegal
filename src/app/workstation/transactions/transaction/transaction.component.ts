import Utils from '@app/core/utils/utils';
import { Component, OnInit, OnDestroy, ComponentFactoryResolver, ViewContainerRef, ViewChild, ElementRef, EventEmitter, Output, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { forkJoin, of, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Location } from '@angular/common';
import { BAUnit } from '../../baUnit/baUnit.model';
import * as _ from 'lodash';
import { TaskStateManagerService } from '@app/registration/task/taskManager.service';
import { Subscription } from 'rxjs';
import { formList, formMapper } from '../../baseForm/mapper';
import { FormVariables } from '../../baseForm/formVariables.model';
import { Process } from '@app/core/models/process.model';
import { ProcessInstance } from '@app/core/models/processInstance.model';
import { ProcessXml } from '@app/core/models/processXml.model';
import { Task } from '@app/core/models/task.model';
import { Transaction } from '@app/core/models/transaction.model';
import { User } from '@app/core/models/user.model';
import { AccessRights } from '@app/core/models/accessRight';
import { ProcessService } from '@app/core/services/process.service';
import { TransactionService } from '@app/core/services/transaction.service';
import { UserService } from '@app/core/services/user.service';
import { UtilService } from '@app/core/utils/util.service';
import { ValidationService } from '@app/core/utils/validation.service';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { RRRValidationTransaction } from '@app/admin/rrr-validation/model/rrr-validation-transaction.model';
import { RRRValidation } from '@app/admin/rrr-validation/model/rrr-validation.model';

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.scss'],
})
export class TransactionComponent implements OnInit, OnDestroy {
    instance: ProcessInstance;
    selectedProcessLabel: string;
    displayForm = false;
    transaction: Transaction = new Transaction();
    transactions: Transaction[];
    cols: any[];
    displayUploader: boolean;
    formVariables: FormVariables;
    workflowProcesses: SelectItem[];
    baUnit: BAUnit;
    rrrValidation: RRRValidation;
    showRRRList: boolean;
    processXml: ProcessXml;
    forms: SelectItem[];
    firstFormKey: string;
    selectedForm: string;
    showRRRValidationList: boolean;
    hasSystemAdministratorAccess: boolean;
    stepArray=['step1', 'step2', 'step3'];
    stepLabel=[this.translateService.instant('TASK.PROCESS'), this.translateService.instant('TRANSACTION.INFORMATIONS'),
   this.translateService.instant('RRR_VALIDATION.TITLE_LIST')]
    currentStep="step1";
    @Input() transactionID: string;
    @Output() processSelected = new EventEmitter();
    @Output() stepEvent = new EventEmitter();
    @Output() successCloseEvent = new EventEmitter();


    transactionRoles: { value: string; label: string }[];
    user: User;

    @ViewChild('lazyRRRs', { read: ViewContainerRef })
    private lazyRRRsVcRef: ViewContainerRef;

    @ViewChild('lazyRRRValidations', { read: ViewContainerRef })
    private lazyRRRValidationsVcRef: ViewContainerRef;

    @ViewChild('lazyCoreWfModeler', { read: ViewContainerRef })
    private lazyCoreWfModelerVcRef: ViewContainerRef;

    @ViewChild('lazyForm', { read: ViewContainerRef })
    private lazyFormVcRef: ViewContainerRef;

    @ViewChild("form") transactionForm: ElementRef;
    @ViewChild('submitButton') submitTransactionForm: ElementRef;

    private transactionSubscription: Subscription;
    private processesSubscription: Subscription;
    private processSubscription: Subscription;
    isFormValid: boolean;

    constructor(
        private transactionService: TransactionService,
        protected validationService: ValidationService,
        protected translateService: TranslateService,
        protected location: Location,
        private route: ActivatedRoute,
        private utilService: UtilService,
        private processService: ProcessService,
        private alertService: AlertService,
        private router: Router,
        private userService: UserService,
        private taskManagerService: TaskStateManagerService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
    ) {
        this.user = this.userService.getCurrentUser();
        this.hasSystemAdministratorAccess = this.user.hasPermission(AccessRights.SYSTEM_ADMINISTRATOR);
    }

    ngOnInit(): void {
        this.currentStep="step1";
        const transactionId = this.transactionID;

        const transactionObs = transactionId
            ? this.transactionService.getTransaction(transactionId)
            : of(this.transaction);

        this.transactionSubscription = transactionObs.subscribe(
            (transaction) => {
                this.transaction = transaction;
                this.baUnit = this.getBaUnit(transaction.initialContextObject);
                this.getProcess(transactionId, transaction);
            },
            (err) => this.alertService.apiError(err),
        );

        this.transactionRoles = this.transaction
            .getTransactionRoles()
            .map((role) => ({ value: role, label: this.translateService.instant(`TRANSACTION.${role}`) }));
    }

    ngOnDestroy(): void {
        if (this.transactionSubscription) {
            this.transactionSubscription.unsubscribe();
        }
        if (this.processesSubscription) {
            this.processesSubscription.unsubscribe();
        }
        if (this.processSubscription) {
            this.processSubscription.unsubscribe();
        }
    }

    private getBaUnit(context: any) {
        return context && context.baUnit && context.baUnit.value
            ? new BAUnit(JSON.parse(context.baUnit.value))
            : new BAUnit();
    }

    private getProcess(transactionId: any, transaction: Transaction) {
        const processObs: Observable<Process | Process[]> = !transactionId
            ? this.processService.getProcesses({ latestVersion: true })
            : this.processService.getProcess(new Process({ id: transaction.workflowProcessId }));

        this.processesSubscription = processObs.subscribe(
            (processes: Process | Process[]) => {
                this.workflowProcesses = Array.isArray(processes)
                    ? processes.map((p) => p.toSelectItem())
                    : [].concat(processes.toSelectItem());
                this.workflowProcesses.unshift(this.utilService.getSelectPlaceholder());
                if (!Array.isArray(processes)) {
                    this.loadDiagram(processes);
                }
                let process = <Process> processes;
                this.selectedProcessLabel = process.toSelectItem().label;
            },
            (err) => this.alertService.camundaError(err),
        );
    }

    save(transaction: Transaction, form) {
        if (form.invalid) {
            const errorResult = this.validationService.validateForm(form);
            return this.alertService.error(errorResult.message);
        }
        else if(this.transaction.name==undefined || this.transaction.name==null)
        {
            this.setStep("step2");
            return null;
        }

        const saveObs = transaction.id
            ? this.transactionService.updateTransaction(transaction)
            : this.transactionService.addTransaction(transaction);

        saveObs.subscribe(
            (t) => {
                this.alertService.success('API_MESSAGES.SAVE_SUCCESSFUL');
                this.transaction = t;
                this.goToList();
                this.successCloseEvent.emit(true);
            },
            (err) => this.alertService.apiError(err),
        );
    }

    goToList(): void {
        this.router.navigate(['transactions']);
    }

    cancel(): void {
        this.location.back();
    }

    async showRRRs() {
            const { RRRsComponent } = await import('../../rrr/rrrs/rrrs.component');
            setTimeout(() => {
                this.lazyRRRsVcRef.clear();

                const rrrs = this.lazyRRRsVcRef.createComponent(this.cfr.resolveComponentFactory(RRRsComponent));
                rrrs.instance.formVariables = new FormVariables({ baUnit: this.baUnit });
                rrrs.instance.isPopup=true;
                rrrs.instance.saved.subscribe(($event: any) => {
                    this.updateBaUnit($event);
                });
            }, 100);
    }

    /**
     *
     */
    async showRRRValidations() {
            const { RRRValidationsComponent } = await import(
                '../../../admin/rrr-validation/rrr-validations/rrr-validations.component'
            );
            setTimeout(() => {
                this.lazyRRRValidationsVcRef.clear();

                const rrrValidations = this.lazyRRRValidationsVcRef.createComponent(
                    this.cfr.resolveComponentFactory(RRRValidationsComponent),
                );
                rrrValidations.instance.selectedOptions = this.transaction.rrrValidationTransactions;
                rrrValidations.instance.formVariables = new FormVariables({ rrrValidation: this.rrrValidation });
                rrrValidations.instance.isPopup=true;
                rrrValidations.instance.selectedRRRValidation.subscribe(($event: any) => {
                    this.selectRRRValidation($event);
                });
            }, 100);
    }

    updateBaUnit($event) {
        this.baUnit = $event.val;
        this.setBaUnitInInitialContext(this.baUnit, this.transaction.initialContextObject);
    }

    private setBaUnitInInitialContext(unit: BAUnit, context: any) {
        context = context.baUnit && context.baUnit.value ? context : { baUnit: { value: null } };
        context.baUnit.value = JSON.stringify(unit).replace('"/g', '\\"');
        this.transaction.initialContextObject = context;
    }

    loadDiagram(process: Process) {
        this.processXml = null;

        this.processService.getProcessXml(new Process({ id: process.id })).subscribe(
            (processXml) => {
                this.processXml = processXml;
                this.lazyLoadCoreWfModeler();
            },
            (err) => this.alertService.camundaError(err),
        );
    }

    async lazyLoadCoreWfModeler() {
        const { WfModelerComponent } = await import('../../../core/layout/workflow/modeler/wf-modeler.component');
        setTimeout(() => {
            this.lazyCoreWfModelerVcRef.clear();

            const CoreWfModeler = this.lazyCoreWfModelerVcRef.createComponent(
                this.cfr.resolveComponentFactory(WfModelerComponent),
            );
            CoreWfModeler.instance.processXml = this.processXml.bpmn20Xml;
            CoreWfModeler.instance.elementSelected.subscribe(($event: any) => {
                this.checkElement($event);
            });
        }, 100);
    }

    checkElement(event) {
        if (event.element.type !== 'bpmn:UserTask') {
            this.forms = null;
            this.displayForm = false;
            return;
        }

        this.formVariables = new FormVariables(this.transaction.initialContextObject);
        const formKey = event.element.businessObject.formKey || event.element.businessObject.$attrs['camunda:formKey'];
        this.forms = Utils.makeAllFormsReadOnly(Utils.formsKeyToSelectItem(formKey));
        this.selectedForm = this.forms[0].value;
        this.lazyLoadForm();
        this.taskManagerService.changeSelectedFormKey({
            form: this.selectedForm,
            task: new Task({}),
            formVariables: this.formVariables,
        });

        if (!this.requestedFormsExists(this.forms)) {
            return;
        }

        this.translateForms(this.forms, true, this.firstFormKey);

        this.displayForm = true;
    }

    async lazyLoadForm() {
        const { FormComponent } = await import('../../baseForm/form.component');
        if (this.selectedForm) {
            setTimeout(() => {
                this.lazyFormVcRef.clear();
                const form = this.lazyFormVcRef.createComponent(this.cfr.resolveComponentFactory(FormComponent));
                form.instance.canceled.subscribe(() => {
                    this.cancel();
                });
                form.instance.saved.subscribe(($event: any) => {
                    this.save($event.data, $event.form);
                });
            }, 100);
        }
    }

    private translateForms(forms: any, moveToFirstForm: any, selected: any) {
        const labels = forms.map((form) => this.translateService.get(`${formMapper(`${form.value}`).label}.TITLE`));

        forkJoin(labels).subscribe(
            (translatedLabels) => {
                this.forms = forms.map((form: any, i) => {
                    form.label = translatedLabels[i];
                    return form;
                });
            },
            (err) => this.alertService.apiError(err),
        );
    }

    private requestedFormsExists(forms: SelectItem[]): boolean {
        const requestedForms = Utils.getFormKeys(forms);
        const unknownForms = _.differenceWith(requestedForms, Object.keys(formList), _.isEqual);

        // checks if the keys for the requested form are present in one of the form template
        if (_.isEmpty(requestedForms) || !_.isEmpty(unknownForms)) {
            this.alertService.error('MESSAGES.FORM_TEMPLATE_PATTERN_ERROR');
            return false;
        }

        return true;
    }

    onDialogClose(event) {
        this.displayForm = event;
    }

    setSelectedProcess(event:Process){
        this.transaction.workflowProcessId=event.id;
        this.setProcessKey();
        this.processSelected.emit(true);
    }
    unSelectProcess(){
        this.transaction.workflowProcessId=null;
        this.transaction.processKey=null;
        this.selectedProcessLabel=undefined;
        this.processXml = null;
    }
    setProcessKey() {
        if (this.transaction.workflowProcessId) {
            const processObs: Observable<Process> = this.processService.getProcess(
                new Process({ id: this.transaction.workflowProcessId }),
            );
            this.processSubscription = processObs.subscribe(
                (process) => {
                    this.transaction.processKey = process.key;
                    this.selectedProcessLabel = process.toSelectItem().label;
                    this.loadDiagram(process);
                },
                (err) => this.alertService.camundaError(err),
            );
        }
    }

    selectRRRValidation(obj) {
        if (obj.checked) {
            const rrrValidationTransaction = new RRRValidationTransaction({
                rrrValidationId: obj.rrrValidation.id,
                rrrValidation: obj.rrrValidation,
                requiredRRR: obj.requiredRRR,
                transactionId: this.transaction.id,
            });

            const index = this.transaction.rrrValidationTransactions.findIndex(
                (r) => r.rrrValidation.id === rrrValidationTransaction.rrrValidationId,
            );

            if (index !== -1) {
                this.transaction.rrrValidationTransactions[index] = rrrValidationTransaction;
            } else {
                this.transaction.rrrValidationTransactions.push(rrrValidationTransaction);
            }
        } else {
            _.remove(
                this.transaction.rrrValidationTransactions,
                (val) => val.rrrValidation.id === obj.rrrValidation.id,
            );
        }
    }
    setStep(step){
        switch (step) {
            case 'step1':
                {
                    this.currentStep=step;
                    this.stepEvent.emit(1)
                break;
            }
            case 'step2':
                {
                    this.currentStep=step;
                    this.stepEvent.emit(2)
                break;
            }

            //Comnenté en attendant de savoir son role dans la creation d'une transaction.
            
            // case 'step3':
            //     {
            //         this.currentStep=step;
            //         this.stepEvent.emit(3);
            //         this.isFormValid=this.formValid();
            //     if(this.transaction.workflowProcessId!=null && this.transaction.workflowProcessId != undefined)
            //     {
            //         if(this.isFormValid)
            //             this.showRRRs();
            //     }
            // }
            //     break;
            case 'step3':
               { 
                this.currentStep=step;
                this.stepEvent.emit(3);
                this.isFormValid=this.formValid();
                if(this.transaction.workflowProcessId!=null && this.transaction.workflowProcessId != undefined)
                {
                    if(this.isFormValid)
                        this.showRRRValidations();
                }
            }
                break;
        }
    }
    formValid():boolean{
        if (this.transaction.name==null || this.transaction.name=='' || this.transaction.role==null || this.transaction.role==='') {
            //this.setStep("step2");
            return false;
        }else
        {
            return true;
        }
    }
    saveTransaction(){
        this.submitTransactionForm.nativeElement.click();  
    }
}

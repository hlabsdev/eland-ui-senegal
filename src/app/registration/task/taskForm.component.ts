import { animate, state, style, transition, trigger } from '@angular/animations';
import {
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {NgForm} from '@angular/forms';
import {AlertService} from '@app/core/layout/alert/alert.service';
import {Form} from '@app/core/models/form.model';
import { ProcessTypes } from '@app/core/models/process.model';
import {UtilService} from '@app/core/utils/util.service';
import {ValidationService} from '@app/core/utils/validation.service';
import {TaskDialogsService} from '@app/registration/task/dialogs/taskDialogs.service';
import {FormVariables} from '@app/workstation/baseForm/formVariables.model';
import {formList, formMapper} from '@app/workstation/baseForm/mapper';
import {TranslateService} from '@ngx-translate/core';
import { Process } from '@app/core/models/process.model';
import {ProcessInstance} from '@app/core/models/processInstance.model';
import {ProcessXml} from '@app/core/models/processXml.model';
import {RowSizes} from '@app/core/models/rowSize.model';
import {Task} from '@app/core/models/task.model';
import {TaskComment} from '@app/core/models/taskComment.model';
import {Transaction} from '@app/core/models/transaction.model';
import {User} from '@app/core/models/user.model';
import {Variables} from '@app/core/models/variables.model';
import {FormService} from '@app/core/services/form.service';
import {ProcessService} from '@app/core/services/process.service';
import {TaskService} from '@app/core/services/task.service';
import {TransactionHistoryService} from '@app/core/services/transactionHistory.service';
import {TransactionInstanceService} from '@app/core/services/transactionInstance.service';
import {TransactionService} from '@app/core/services/transaction.service';
import {UserService} from '@app/core/services/user.service';
import {
    PreregistrationFormalityService
} from '@app/workstation/preregistrationFormalities/preregistrationFormality/preregistrationFormality.service';
import * as _ from 'lodash';
import {SelectItem} from 'primeng/api';
import {forkJoin, of, Subscription} from 'rxjs';
import {map} from 'rxjs/operators';
import {TaskStateManagerService} from './taskManager.service';

@Component({
    selector: 'app-tasks-detail',
    templateUrl: './taskForm.component.html',
    styleUrls: ['./taskForm.component.scss'],
    animations: [
        trigger('rowExpansionTrigger', [
            state(
                'void',
                style({
                    transform: 'translateX(-10%)',
                    opacity: 0,
                }),
            ),
            state(
                'active',
                style({
                    transform: 'translateX(0)',
                    opacity: 1,
                }),
            ),
            transition('* <=> *', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
        ]),
    ],
})
export class TaskFormComponent implements OnInit, OnDestroy {
    private taskCommentSubscription = new Subscription();

    @ViewChild('lazyForm', { read: ViewContainerRef })
    private lazyFormVcRef: ViewContainerRef;

    @ViewChild('chatModal', { static: false }) chatModal:ElementRef;

    @ViewChild('workflowModal', { static: false }) workflowModal:ElementRef;

    @ViewChild('mapModal', { static: false }) mapModal:ElementRef;

    displayModal: boolean = false;
    displayMap: boolean = false;
    displayWorkflow: boolean = false;

    openChat = () => this.displayModal = true;

    openWorkflow(): void {
        this.workflowModal.nativeElement.classList.add('show');
        this.workflowModal.nativeElement.style.width = '100vw';
    }

    closeWorkflow(): void {
        this.workflowModal.nativeElement.classList.remove('show');
        setTimeout(() => {
          this.workflowModal.nativeElement.style.width = '0';
        }, 75);
    }

    openMap(): void {
        this.displayMap = true;
    }

    closeMap(): void {
        setTimeout(() => {
            this.displayMap = false;
        }, 75);
    }

    isFirstForm = true;
    isLastForm = false;
    taskId: string;
    legacy: boolean;
    selectedForm: string;
    refreshTaskSub: Subscription;

    task: Task;
    rowSizes: any = RowSizes;
    variables: Variables;
    processXml: ProcessXml;
    selectorNames = [];
    cols: any[];
    user: User;
    claimedByUser = false;
    isFastTrackProcess = false;

    process: Process;
    selectedTaskSub: Subscription;

    forms: SelectItem[];
    formVariables: FormVariables;

    taskComments: TaskComment[] = [];

    errorMessage: string;
    sidebarFormat: string;
    requiredForms: string[];

    taskProcessInstanceId: string;
    sameUserPattern = '@sameuser@';

    transactionData: {
        processInstance: ProcessInstance;
        transaction: Transaction;
    } = {
        processInstance: new ProcessInstance(),
        transaction: new Transaction(),
    };

    constructor(
        private taskService: TaskService,
        private alertService: AlertService,
        private processService: ProcessService,
        protected translateService: TranslateService,
        private utilService: UtilService,
        private userService: UserService,
        private transactionService: TransactionService,
        protected validationService: ValidationService,
        protected taskManagerService: TaskStateManagerService,
        private preregistrationService: PreregistrationFormalityService,
        private formService: FormService,
        private transactionInstanceService: TransactionInstanceService,
        private transactionInstanceHistoryService: TransactionHistoryService,
        private taskDialogsService: TaskDialogsService,
        private cfr: ComponentFactoryResolver,
        private changeDetectorRef: ChangeDetectorRef,
    ) {
        this.taskDialogsService.newTaskComment.subscribe((newTask) => this.saveTaskComment(newTask));
    }

    ngOnInit(): void {
        this.user = this.userService.getCurrentUser();
        this.taskManagerService.selectedFormKeyChange$.subscribe((newKey) => {
            this.selectedForm = newKey ? newKey.form : null;
        });

        this.taskManagerService.changeTaskListViewChange$.subscribe((value) => {
            this.sidebarFormat = value;
        });

        this.selectedTaskSub = this.taskManagerService.selectedTaskChange$.subscribe((task) => {
            this.loadTasks(task, true);
        });

        this.refreshTaskSub = this.taskManagerService.refreshTaskFormChange$.subscribe((task) => {
            this.loadTasks(task, false);
        });
        this.lazyLoadForm();
    }

    ngOnDestroy(): void {
        this.selectedTaskSub.unsubscribe();
        this.refreshTaskSub.unsubscribe();
        this.taskCommentSubscription.unsubscribe();
    }

    loadTasks(task: Task, moveToFirstForm: boolean) {
        if (!task) {
            // this.alertService.warning("TASK NOT LOADED PROPERLY, PERHAPS THE BPMN FILE IS NOT VALID");
            // console.log("TASK NOT LOAD PROPERLY");
            return (this.taskId = null);
        }

        this.taskId = task.id;
        this.getTaskandVariables(new Task({ id: this.taskId }), moveToFirstForm);
    }

    showDisplayDialog() {
        if (!this.checkCompletedForms()) {
            this.taskDialogsService.setDisplayVisibility(true);
        }
    }

    showAddCommentDialog() {
        this.taskDialogsService.resetTaskComment();
        this.taskDialogsService.setCommentDisplayVisibility(true);
    }

    saveTaskComment(taskComment: TaskComment) {
        taskComment.taskName = this.task.name;
        taskComment.username = this.user.username;
        taskComment.dateTime = new Date();
        this.taskComments.unshift(taskComment);
        this.taskComments = [].concat(this.taskComments);
        this.taskCommentSubscription.add(
            this.processService
                .putInstanceVariableJson(this.task.processInstanceId, this.taskComments, 'comments')
                .subscribe(() => this.taskDialogsService.setCommentDisplayVisibility(false)),
        );
    }

    getTaskandVariables(task: Task, moveToFirstForm: boolean) {
        const taskObs = this.taskService.getTask(task);
        const taskVariableObs = this.taskService.getTaskVariables(task);

        return forkJoin([taskObs, taskVariableObs]).subscribe(
            ([tsk, variables]) => {
                this.task = tsk;
                this.claimedByUser = tsk && tsk.assignee === this.user.username;
                // check for messagesCodes
                this.variables = variables;
                if (variables && variables.messageCode && variables.messageCode.value) {
                    try {
                        const messCodeValue = JSON.parse(variables.messageCode.value);
                        this.alertService[messCodeValue.type.toLowerCase()](
                            this.translateService.instant('MESSAGES.BPMN-CODES.' + messCodeValue.message),
                        );
                        this.taskService.deleteTaskVariable(task, 'messageCode').subscribe(() => {});
                    } catch (e) {
                        // no error or bad format
                    }
                }

                this.taskProcessInstanceId = tsk.processInstanceId;
                this.loadDiagram(tsk);
                this.getFormLabelsAndSetDefault({
                    forms: tsk.formSelectItem(),
                    variables,
                    selected: tsk.firstFormKey(),
                    moveToFirstForm,
                });
                this.getProcessInstanceComments(tsk.processInstanceId);
                this.getProcessDefinition(tsk.processDefinitionId);

                this.isFastTrackProcess = (variables.isFastTrackProcess && variables.isFastTrackProcess.value) || false;
                this.getTaskTransaction(this.task, this.isFastTrackProcess);

                // gis integration [

                if (variables.processType !== undefined) {
                    if (variables.NICAD !== undefined) {
                        if (this.formVariables) {
                            this.formVariables.arcGIS = {
                                NICAD: variables.NICAD.value,
                            };
                        }
                    }

                    this.formVariables.arcGIS = {
                        ...this.formVariables.arcGIS,
                        processType: variables.processType.value.toUpperCase(),
                    };
                    if (variables.processType.value.toUpperCase() === ProcessTypes.division) {
                        if (variables.NICAD1 !== undefined) {
                            if (this.formVariables && this.formVariables.arcGIS.NICAD) {
                                this.formVariables.arcGIS = {
                                    ...this.formVariables.arcGIS,
                                    NICADs: variables.NICAD1.value.split(','),
                                };
                            }
                        }
                    }
                }
                // gis integration ]
            },
            (err) => this.alertService.apiError(err),
        );
    }

    async getFormLabelsAndSetDefault(args: any = {}) {
        const { forms, variables, selected, moveToFirstForm } = args;
        let dbForms = false;
        const tmpFormMapper = formMapper(forms[0].value);
        if (forms && forms.length === 1 && !tmpFormMapper) {
            // check if its formGroup
            let form;
            try {
                form = await this.formService.getFormByDbName(forms[0].value).toPromise();
                if (!form.id) {
                    form = false;
                }
            } catch (e) {
                // if error that mean its not a database form
                form = false;
            }
            if (form) {
                form = new Form(form);
                if (form.childFormsArr && form.childFormsArr.length) {
                    dbForms = form.childFormsArr.map((f) => {
                        const newName =
                            f.name +
                            (f.readOnly ? '.READONLY' : '') +
                            (f.required ? '.REQUIRED' : '') +
                            (f.links ? '.LINKS' : '');
                        return { label: newName, value: newName };
                    });
                }
            }
        }
        const varSelected = dbForms ? dbForms[0].label : selected;
        const varForms = dbForms || forms;
        this.taskManagerService.setRequiredForms([]);
        this.taskManagerService.setRequiredErrorForms([]);
        this.requiredForms = [];
        for (const form of varForms) {
            if (form.value.includes('.REQUIRED')) {
                const indDot = form.value.indexOf('.');
                this.requiredForms.push(form.value.substring(0, indDot && indDot !== -1 ? indDot : undefined));
            }
        }
        this.taskManagerService.setRequiredForms(this.requiredForms);
        this.formVariables = new FormVariables(variables);
        const availableForms = Object.keys(formList);

        this.preregistrationService.assignPrePopulatedData(this.formVariables);

        // holds the keys of the requested form
        const requestForms = varForms.map((form) => (form.value ? _.first(_.split(form.value, '.')) : form.value));
        // checks if the keys for the requested form are present in one of the form template
        if (varForms.length <= 0 || !this.utilService.arrayContainsArray(availableForms, requestForms)) {
            this.alertService.error('MESSAGES.FORM_TEMPLATE_PATTERN_ERROR');
            return this.goBack();
        }
        const labels = varForms.map((form) => {
            const translate = formMapper(`${form.value}`);
            if (
                (translate.label === 'SOURCES' ||
                    translate.label === 'COMPLEMENTARY_INFO' ||
                    translate.label === 'NOTICE') &&
                form.value.includes('.')
            ) {
                const formValue = _.clone(form.value);
                const subType = _.last(_.split(formValue.replace('.READ_ONLY', ''), '.'));

                if (subType === 'APP-SOURCES') {
                    return this.translateService.get(`${translate.label}.TITLE`);
                }

                if (subType === 'APP-COMPLEMENTARY-INFO') {
                    return this.translateService.get(`${translate.label}.TITLE`);
                }

                if (subType === 'APP-NOTICE') {
                    return this.translateService.get(`${translate.label}.TITLE`);
                }

                return this.translateService.get(`${translate.label}.${subType}`);
            } else {
                return this.translateService.get(`${translate.label}.TITLE`);
            }
        });

        return forkJoin(labels).subscribe(
            async (translatedLabels) => {
                const translatedForms = varForms.map((form: any, i) => {
                    form.label = translatedLabels[i];
                    return form;
                });
                // holds the form created from the template
                this.forms = translatedForms;
                this.legacy = this.forms && this.forms.length > 1;
                // if there is an error with the api, trows an error
                this.taskManagerService.changeSelectedFormKey({
                    form: moveToFirstForm ? varSelected : this.selectedForm,
                    task: this.task,
                    formVariables: this.formVariables,
                });
            },
            (err) => this.alertService.apiError(err),
        );
    }

    cancel() {
        this.goBack();
    }

    save(dataObject: { data: { val: any; variable: any }; formName: string }): void {
        let tmpFormNamesArray;
        try {
            if (dataObject.data.variable.completedFormNames) {
                tmpFormNamesArray = [];
            } else {
                tmpFormNamesArray = JSON.parse(dataObject.data.variable.completedFormNames.value);
            }
        } catch (e) {
            tmpFormNamesArray = [];
        }
        if (dataObject.formName && !tmpFormNamesArray.includes(dataObject.formName.split('.').slice(0, -1).join('.'))) {
            tmpFormNamesArray.push(dataObject.formName.split('.').slice(0, -1).join('.'));
        }
        if (dataObject && dataObject.data) {
            this.taskManagerService.setRequiredErrorForms([]);
            if (dataObject.data.variable) {
                if (dataObject.data.variable.completedFormNames) {
                    dataObject.data.variable.completedFormNames = dataObject.data.variable.completedFormNames || {
                        type: 'string',
                    };
                    dataObject.data.variable.completedFormNames.value = JSON.stringify(tmpFormNamesArray);
                }
                const varNames = Object.keys(dataObject.data.variable);
                this.loopPutTaskVariable(varNames.shift(), dataObject.data, varNames);
                // Postponing the refactoring until Camunda 7.14
                // this.allAtOncePutTaskVariables(varNames, dataObject.data);
            }
        }
        this.taskManagerService.refreshForm();
    }

    /* TODO: FON-1351
       Refactoring this to group all variables and push them once in the task
       Refer to Camunda REST API: https://docs.camunda.org/manual/latest/reference/rest/task/variables/post-modify-task-variables/
   */
    loopPutTaskVariable(varName: string, obj: { val: any; variable: any }, varNames: string[]) {
        if (!varName) {
            return;
        }
        this.taskService.putTaskVariable(this.task, varName, obj.variable[varName]).subscribe(
            () => {
                this.getTaskandVariables(this.task, false);
                if (varNames.length) {
                    this.loopPutTaskVariable(varNames.shift(), obj, varNames);
                } else {
                    this.refreshTask();
                }
            },
            (err) => this.alertService.camundaError(err),
        );
    }

    // Postponing the refactoring until Camunda 7.14
    // allAtOncePutTaskVariables(varNames: string[], obj: { val: any, variable: any }) {
    //   this.getTaskandVariables(this.task, false);
    //   if (varNames.length) {
    //     this.taskService.putTaskVariables(this.task, obj);
    //   } else {
    //     this.refreshTask();
    //     return;
    //   }
    // }

    loadDiagram(task: Task) {
        this.processXml = null;
        const isProcess = task && task.caseDefinitionId === null;
        if (!isProcess) {
            // TODO: get CMMN xml and render
            return;
        }
        this.processService.getProcessXml(new Process({ id: task.processDefinitionId })).subscribe(
            (processXml) => {
                this.processXml = processXml;
            },
            (err) => this.alertService.camundaError(err),
        );
    }

    complete(task: Task, completeVars: Variables) {
        completeVars = completeVars || {};
        completeVars.completedFormNames = { value: '[]', type: 'Json' };
        this.taskService.completeTask(task, completeVars).subscribe(
            (tsk) => {
                this.taskDialogsService.setDisplayVisibility(false);
                this.task = tsk;
                this.alertService.success('TASK.COMPLETED');
                this.taskManagerService.changeTaskListView("medium");
                this.reAssignTask();
                this.taskManagerService.completeTask();
            },
            (err) => this.alertService.camundaError(err),
        );
    }

    checkCompletedForms() {
        let errors = false;
        if (this.requiredForms) {
            const tmpFormNames = this.variables.completedFormNames
                ? JSON.parse(this.variables.completedFormNames.value)
                : [];
            const reqErrorForms = _.clone(this.requiredForms);
            for (const formName of tmpFormNames) {
                const ind = reqErrorForms.indexOf(formName);
                if ((ind || ind === 0) && ind !== -1) {
                    reqErrorForms.splice(ind, 1);
                }
            }
            this.taskManagerService.setRequiredErrorForms(reqErrorForms);
            errors = reqErrorForms.length > 0;
        }
        if (errors) {
            this.alertService.error('MESSAGES.FORMS-NOT-COMPLETED');
        }
        return errors;
    }

    continue(task: Task, form: NgForm, inputFieldName: string) {
        const choosenOption = form.form.get(inputFieldName).value;
        if (choosenOption) {
            const multipleChoicesVars = {
                multipleChoicesValue: { value: choosenOption, type: 'String', valueInfo: {} },
            };
            this.complete(task, multipleChoicesVars);
        }
    }

    goBack(args = {}) {
        this.taskManagerService.releaseTask();
        this.taskManagerService.changeTaskListView("medium");
    }
    refreshTask(task: Task = this.task) {
        this.taskManagerService.refreshTaskForm(task);
    }

    /**
     * get all variables
     *
     * @param processInstanceId
     */
    getProcessInstanceComments(processInstanceId: string) {
        return this.processService
            .getInstanceVariablesByProcessInstanceId(processInstanceId)
            .pipe(
                map((val: any) => {
                    const obs: any =
                        val && val.comments
                            ? this.processService.getInstanceVariableDeserialized(processInstanceId, 'comments')
                            : of([]);
                    return obs;
                }),
            )
            .subscribe(
                (obs: any) =>
                    obs.subscribe(
                        (val) => {
                            this.taskComments = val && val.value ? JSON.parse(val.value) : [];
                        },
                        (err) => this.alertService.camundaError(err),
                    ),
                (err) => this.alertService.camundaError(err),
            );
    }

    reAssignTask() {
        this.taskService
            .getCurrentTask(this.taskProcessInstanceId)
            .toPromise()
            .then((curTask: Task) => {
                this.taskService.getTaskHistory(curTask).subscribe((tasks) => {
                    if (tasks.length > 0) {
                        // (backward) return task to the user who was working on it
                        this.taskService
                            .setAssignee(curTask.id, tasks[0].assignee)
                            .subscribe(() => this.taskManagerService.completeTask());
                    } else {
                        // (forward) assign a task to user who was the last working in same group
                        if (curTask.id) {
                            this.taskService.getTaskIdentityLink(curTask).subscribe((identityLinks) => {
                                if (identityLinks.filter((link) => link.userId === this.sameUserPattern).length > 0) {
                                    const candidateGroup = identityLinks.filter((link) => link.groupId !== null)[0]
                                        .groupId;
                                    this.taskService
                                        .getTasksFromHistory(curTask.processInstanceId, candidateGroup)
                                        .subscribe((historyTasks) => {
                                            if (historyTasks.length > 0) {
                                                this.taskService
                                                    .setAssignee(curTask.id, historyTasks[1].assignee)
                                                    .subscribe(() => this.taskManagerService.completeTask());
                                            }
                                        });
                                }
                            });
                        }
                    }
                });
            });
    }

    getProcessDefinition(processInstanceId: string) {
        return this.processService.getProcessById(processInstanceId).subscribe(
            (process: Process) => (this.process = process),
            (err) => this.alertService.camundaError(err),
        );
    }

    selectForm(form:SelectItem) {
        this.selectedForm = form.value;
        this.taskManagerService.changeSelectedFormKey({
            form: this.selectedForm,
            task: this.task,
            formVariables: this.formVariables,
        });
    }

    getTaskTransaction(task: Task, isFastTrackProcess: boolean) {
        this.transactionInstanceHistoryService
            .getRootProcessInstanceId(task.processInstanceId, isFastTrackProcess)
            .then((id) => {
                this.transactionInstanceService
                    .getTransactionInstancesByWorkflowId(id)
                    .toPromise()
                    .then((transactionInstance) => {
                        this.transactionService
                            .getTransaction(transactionInstance.transaction.id)
                            .subscribe((transaction) => (this.formVariables.validationTransaction = transaction));
                    });
            })
            .catch((err) => this.alertService.apiError(err));
    }
    async lazyLoadForm() {
        const { FormComponent } = await import('../../workstation/baseForm/form.component');
        setTimeout(() => {
            if(this.lazyFormVcRef){
                this.lazyFormVcRef.clear();
                const form = this.lazyFormVcRef.createComponent(this.cfr.resolveComponentFactory(FormComponent));
                form.instance.canceled.subscribe(($event) => {
                    this.cancel();
                });
                form.instance.saved.subscribe(($event: any) => {
                    this.save($event);
                });
                form.instance.clickedEvent.subscribe(($event: any) => {
                    this.clickEvent($event);
                });
            }
        }, 100);
        this.changeDetectorRef.detectChanges();
    }
    clickEvent($event:any){
        const currentForm = this.forms.find(form=>form.value===$event.value);
        this.selectForm(currentForm);
        const newIndex =  this.findIndexOfCurrentForm();
        this.checkStates(newIndex);
    }
    findIndexOfCurrentForm():number{
        const currentForm = this.forms.find(form=>form.value===this.selectedForm );
        const index = currentForm ? this.forms.indexOf(currentForm) : 0;
        return index;
    }
    checkStates(newIndex){
        if( this.forms.length == 1)
        {
            this.isFirstForm=true;
            this.isLastForm=true;
        }else if(this.forms.length==newIndex+1)
        {
            this.isLastForm = true;
            this.isFirstForm = false;
        }else if( 0 == newIndex )
        {
            this.isFirstForm = true;
            this.isLastForm = false;
        }
        else
        {
            this.isFirstForm= false;
            this.isLastForm= false;
        }
        
    }
    navigateOnFormsByIndex(unitee){
        const index =  this.findIndexOfCurrentForm();
        const newIndex = index+unitee;
        const newForm = this.forms[newIndex];
        //this.selectedForm=newForm.value;
        this.selectForm(newForm);
        this.checkStates(newIndex);
    }

    changeTaskView(viewType: string) {
        this.taskManagerService.changeTaskListView(viewType);
        this.goBack();
    }
}

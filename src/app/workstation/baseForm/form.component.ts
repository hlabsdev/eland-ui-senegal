import { Task } from '@app/core/models/task.model';
import * as _ from 'lodash';
import { SelectItem } from 'primeng/api';

import {
    Component,
    ComponentFactoryResolver,
    EventEmitter,
    Output,
    ViewChild,
    ViewContainerRef,
    OnDestroy,
    AfterViewInit,
    ChangeDetectorRef,
} from '@angular/core';

import { FormTemplateBaseComponent } from './form-template-base.component';
import { FormVariables } from './formVariables.model';
import { TaskStateManagerService } from '@app/registration/task/taskManager.service';
import { formList, formMapper } from './mapper';
import { Subscription } from 'rxjs';
import {AlertService} from "@app/core/layout/alert/alert.service";

@Component({
    template: '<ng-container #formContainer></ng-container>',
    selector: 'app-form',
})
export class FormComponent implements OnDestroy, AfterViewInit {
    formVariables: FormVariables;
    task: Task;
    formName: string;
    payload: { formVariables: FormVariables; form: any; task: Task };

    @Output() canceled = new EventEmitter<any>();
    @Output() saved = new EventEmitter<any>();
    @Output() clickedEvent = new EventEmitter<any>();


    @ViewChild('formContainer', { read: ViewContainerRef }) private container: ViewContainerRef;
    forms: SelectItem[];
    formList = formList;
    subscription: Subscription;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private taskManagerService: TaskStateManagerService,
        private changeDetectorRef: ChangeDetectorRef,
        private alertService: AlertService,
    ) {}

    ngAfterViewInit(): void {
        this.subscription = this.taskManagerService.selectedFormKeyChange$.subscribe((payload) => {
            if (!payload) {
                // this.alertService.warning("FORM NOT LOADED, TASK SERVICE FAILED TO SELECT TASK");
                // console.log("FORM NOT LOADED, TASK SERVICE FAILED TO SELECT TASK", payload)
                return;
            }

            this.formVariables = payload.formVariables;
            this.task = payload.task;
            this.formName = payload.form;
            this.showTaskForm(this.formName).then(()=>console.log("FORM LOADED SUCCESSFULLY AFTER INIT"));
        });

        this.taskManagerService.refreshFormChange$.subscribe(() => {
            this.showTaskForm(this.formName).then(()=>console.log("FORM LOADED SUCCESSFULLY AFTER INIT"));
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    async showTaskForm(form) {
        if (!form) {
            this.alertService.error("FORM NOT LOADED, COMPONENT FAILED TO LOAD FORM");
            console.log("FORM NOT LOADED, COMPONENT FAILED TO LOAD FORM", form)
            // return;
        }
        // Show links if the forms template has sigtas links or if is a links component
        const showLinks = form.includes('.LINKS') || form.includes('APP-LINKS');

        if (showLinks) {
            form = _.trim(form.replace('.LINKS', '')); // remove LINKS part for mapping
        }

        const isReadOnly = form.includes('.READ_ONLY'); // ReadOnly Forms
        const types = this.formSubType(form); // legal

        if (isReadOnly) {
            form = _.trim(form.replace('.READ_ONLY', '')); // remove readOnly part for mapping
        }

        const componentData = formMapper(form);
        const saveToLadm = !form.includes('CONTEXT');
        this.formVariables =
            this.formVariables instanceof FormVariables ? this.formVariables : new FormVariables(this.formVariables);
        const formVariables = _.extend(this.formVariables, { isReadOnly, saveToLadm, ...types });

        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentData.component);
        const viewContainerRef = this.container;
        if (viewContainerRef) {
            viewContainerRef.clear();
            const componentRef = viewContainerRef.createComponent(componentFactory);

            // set form input
            (<FormTemplateBaseComponent>componentRef.instance).task = this.task;
            (<FormTemplateBaseComponent>componentRef.instance).formVariables = formVariables;
            (<FormTemplateBaseComponent>componentRef.instance).showLinks = showLinks;

            // set form output
            (<FormTemplateBaseComponent>componentRef.instance).canceled.subscribe(() => {
                this.canceled.emit();
            });
            (<FormTemplateBaseComponent>componentRef.instance).saved.subscribe((data) => {
                this.saved.emit({ data, formName: this.formName });
            });
            if ((<FormTemplateBaseComponent>componentRef.instance).hasOwnProperty('clickedEvent')) {
                (<FormTemplateBaseComponent>componentRef.instance).clickedEvent.subscribe(($event) => {
                    this.clickedEvent.emit($event);
                });
            }
            if ((<FormTemplateBaseComponent>componentRef.instance).hasOwnProperty('saveButtonClicked')) {
                (<FormTemplateBaseComponent>componentRef.instance).saveButtonClicked.subscribe((data) => {
                    this.saved.emit({ data, formName: this.formName });
                });
            }
            this.changeDetectorRef.detectChanges();
        }
    }

    formSubType(form) {
        form = form.replace('.READ_ONLY', '');
        const baseForm = _.first(_.split(form, '.'));
        const subType = form.includes('.') ? _.last(_.split(form, '.')) : null;
        const formKeys = Object.keys(this.formList);

        if (!subType || form.includes('READ_ONLY')) {
            return {
                noticeSection: null,
                complementaryInfoSection: null,
                administrativeSourceType: null,
                checklistFormType: null,
            };
        }

        return {
            noticeSection: formKeys.find((v) => v === baseForm) === 'APP-NOTICE' ? subType : null,
            complementaryInfoSection:
                formKeys.find((v) => v === baseForm) === 'APP-COMPLEMENTARY-INFO' ? subType : null,
            administrativeSourceType: formKeys.find((v) => v === baseForm) === 'APP-SOURCES' ? subType : null,
            checklistFormType: formKeys.find((v) => v === baseForm) === 'APP-CHECKLIST' ? subType : null,
        };
    }
}

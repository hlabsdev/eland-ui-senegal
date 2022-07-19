import { AlertService } from '@app/core/layout/alert/alert.service';
import { ApplicationService } from '@app/core/services/application.service';
import { TranslateService } from '@ngx-translate/core';
import { UtilService } from '@app/core/utils/util.service';
import { ValidationService } from '@app/core/utils/validation.service';
import { SigtasService } from '@app/core/services/sigtas.service';
import { getlocaleConstants } from '@app/core/utils/locale.constants';
import { TransactionInstanceService } from '@app/core/services/transactionInstance.service';
import { TransactionHistoryService } from '@app/core/services/transactionHistory.service';
import { Application } from '@app/core/models/application.model';
import { FieldConfig } from '@app/core/models/field.model';
import { Task } from '@app/core/models/task.model';
import { EnterpriseInfo } from '@app/core/models/enterpriseInfo.model';
import { IndividualInfo } from '@app/core/models/individualInfo.model';
import { SelectItem } from 'primeng/api';
import {
    AfterViewInit,
    Component,
    ComponentFactoryResolver,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { FormTemplateBaseComponent } from '@app/workstation/baseForm/form-template-base.component';
import { ParametersService } from '@app/admin/parameters/parameters.service';
import { of, forkJoin } from 'rxjs';
import * as _ from 'lodash';

@Component({
    selector: 'app-application',
    templateUrl: 'application.component.html',
    styleUrls: ['application.component.scss'],
})
export class ApplicationComponent extends FormTemplateBaseComponent implements OnInit, AfterViewInit {
    @Input() readOnly: boolean;
    @Input() task: Task;
    @Input() formVariables: FormVariables;
    @Input() applicationView: Application;
    @Output() saveButtonClicked = new EventEmitter<any>();
    @Output() cancelButtonClicked = new EventEmitter<boolean>();
    @Output() saved = new EventEmitter<any>();
    @Output() canceled = new EventEmitter<boolean>();

    title: string;
    fieldValues: any;
    errorMessage: string;
    config: FieldConfig[];
    isEnabled = false;
    application: Application = new Application();
    individual: IndividualInfo = new IndividualInfo();
    enterprise: EnterpriseInfo = new EnterpriseInfo();
    responsibleOffices: SelectItem[];
    locale: any;
    today: Date;
    yearRange: string;
    formComponentName: string;
    noModification = false;
    taxPayerTypes: SelectItem[];
    individualType = false;
    enterpriseType = false;
    INDIVIDUAL_TYPE = 1;
    ENTERPRISE_TYPE = 2;

    @ViewChild('lazyLinks', { read: ViewContainerRef })
    private lazyLinksVcRef: ViewContainerRef;

    constructor(
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
        private translationService: TranslateService,
        private utilService: UtilService,
        private applicationService: ApplicationService,
        private alertService: AlertService,
        public validationService: ValidationService,
        private transactionInstanceService: TransactionInstanceService,
        private transactionInstanceHistoryService: TransactionHistoryService,
        private parametersService: ParametersService,
        private sigtasService: SigtasService,
    ) {
        super();
    }

    ngOnInit() {
        const { localeSettings } = getlocaleConstants(this.translationService.currentLang);
        this.locale = localeSettings;

        this.today = new Date();
        this.yearRange = `1900:${new Date().getFullYear().toString()}`;

        this.title = 'APPLICATION.APPLICATION';
        this.setup();
    }

    setup() {
        const respObs$ = this.utilService.mapToSelectItems(
            this.parametersService.getAllResponsibleOffices(true),
            '',
            'value.code',
        );
        const taxObs$ = this.utilService.mapToSelectItems(
            this.sigtasService.getTaxPayerTypes(),
            '',
            'value.taxPayerType',
        );

        forkJoin([respObs$, taxObs$]).subscribe(([responsibleOffices, taxPayerTypes]) => {
            this.responsibleOffices = responsibleOffices;
            this.taxPayerTypes = taxPayerTypes;

            let obs$ = null;
            if (this.task && this.task.formKey) {
                obs$ = this.formVariables.applicationId
                    ? this.applicationService.getApplication(this.formVariables.applicationId.toString())
                    : of(this.applicationView || null);
            } else {
                // Loading Application from list of Applications
                obs$ = of(this.applicationView);
            }

            obs$.subscribe((app) => {
                if (app) {
                    this.responsibleOffices.forEach((item) => {
                        if (item.value && app.responsibleOffice && item.value.id === app.responsibleOffice.id) {
                            app.responsibleOffice = item.value;
                        }
                        if (item.value && app.imputationOffice && item.value.id === app.imputationOffice.id) {
                            app.imputationOffice = item.value;
                        }
                    });
                    this.application = app;
                    this.noModification = true;
                    if (this.application.applicant.type !== null && this.application.applicant.sinCode !== null) {
                        this.individualType = this.application.applicant.type === this.INDIVIDUAL_TYPE;
                        this.enterpriseType = this.application.applicant.type === this.ENTERPRISE_TYPE;
                    }
                }
            });
        });
    }

    ngAfterViewInit() {
        this.setup();
        this.lazyLoadLinks();
    }

    async save(form: NgForm) {
        try {
            if (form.invalid) {
                const errorResult = this.validationService.validateForm(form);
                return this.alertService.error(errorResult.message);
            } else {
                await this.getTransactionInstance();

                if (this.formVariables.baUnit) {
                    this.application.baUnitId = this.formVariables.baUnit.uid;
                    this.application.baUnitVersion = this.formVariables.baUnit.version;
                }

                if (this.application.id) {
                    this.applicationService.updateApplication(this.application).subscribe((app) => {
                        this.alertService.success('API_MESSAGES.UPDATE_SUCCESSFUL');
                        this.application = app;
                        this.saved.emit({
                            val: this.application,
                            variable: {
                                applicationId: { value: this.application.id, type: 'String' },
                                applicationNumber: { value: this.application.applicationNumber, type: 'String' },
                                urgentApplication: { value: this.application.urgentApplication, type: 'Boolean' },
                                externalApplicant: { value: this.application.externalApplicant, type: 'Boolean' },
                                application: { value: JSON.stringify(this.application), type: 'Json' },
                            },
                        });
                    });
                } else {
                    this.applicationService.createApplication(this.application).subscribe((app) => {
                        this.alertService.success('API_MESSAGES.SAVE_SUCCESSFUL');
                        this.application = app;
                        this.saved.emit({
                            val: this.application,
                            variable: {
                                applicationId: { value: this.application.id, type: 'String' },
                                applicationNumber: { value: this.application.applicationNumber, type: 'String' },
                                urgentApplication: { value: this.application.urgentApplication, type: 'Boolean' },
                                externalApplicant: { value: this.application.externalApplicant, type: 'Boolean' },
                                application: { value: JSON.stringify(this.application), type: 'Json' },
                            },
                        });
                    });
                }
            }
        } catch (error) {
            this.alertService.displayErrorByType(error);
        }
    }

    cancel() {
        this.canceled.emit(true);
    }

    async searchRequester() {
        return new Promise((resolve, reject) => {
            const id = this.application.applicant.sinCode;

            const result = this.validationService.validateAlpha(id);
            if (result !== null) {
                this.alertService.error(result.message);
                reject(result.message);
                throw new Error(result.message);
            }

            if (this.individualType) {
                this.sigtasService.getIndividualInfo(id).subscribe(
                    (indv) => {
                        this.individual = indv;
                        this.application.applicant.firstName = indv.firstName;
                        this.application.applicant.lastName = indv.lastName;
                        this.application.applicant.email = indv.emailAddress;
                        resolve(indv);
                    },
                    (err) => {
                        this.individual = new IndividualInfo();
                        this.application.applicant.firstName = '';
                        this.application.applicant.lastName = '';
                        this.application.applicant.email = '';
                        this.alertService.displayErrorByType(err);
                        reject(err);
                    },
                );
            }

            if (this.enterpriseType) {
                this.sigtasService.getEnterpriseInfo(id).subscribe(
                    (ent) => {
                        this.enterprise = ent;
                        this.application.applicant.registeredName = ent.registeredName;
                        this.application.applicant.enterpriseType = ent.enterpriseType;
                        this.application.applicant.streetName = ent.streetName;
                        this.application.applicant.responsibleOffice = ent.responsibleOffice;
                        resolve(ent);
                    },
                    (err) => {
                        this.enterprise = new EnterpriseInfo();
                        this.application.applicant.registeredName = '';
                        this.application.applicant.enterpriseType = '';
                        this.application.applicant.streetName = '';
                        this.application.applicant.responsibleOffice = null;
                        this.alertService.displayErrorByType(err);
                        reject(err);
                    },
                );
            }
        });
    }

    selectTaxPayerType($event) {
        if ($event.value === this.INDIVIDUAL_TYPE) {
            this.individualType = true;
            this.enterpriseType = false;
            this.individual = new IndividualInfo();
        } else if ($event.value === this.ENTERPRISE_TYPE) {
            this.enterpriseType = true;
            this.individualType = false;
            this.enterprise = new EnterpriseInfo();
        } else {
            this.enterpriseType = this.individualType = false;
            this.application.applicationRequester = null;
            this.enterprise = new EnterpriseInfo();
            this.individual = new IndividualInfo();
        }
    }

    async getTransactionInstance() {
        return new Promise((resolve, reject) => {
            this.transactionInstanceHistoryService
                .getRootProcessInstanceId(this.task.processInstanceId, this.formVariables.isFastTrackProcess)
                .then((id) => {
                    this.transactionInstanceService.getTransactionInstancesByWorkflowId(id).subscribe(
                        (transactionInstance) => {
                            this.application.transactionInstance = transactionInstance;
                            resolve(transactionInstance);
                        },
                        (err) => reject(err),
                    );
                })
                .catch((err) => reject(err));
        });
    }

    async lazyLoadLinks() {
        const { LinksComponent } = await import('../../links/links.component');
        setTimeout(() => {
            this.lazyLinksVcRef.clear();
            const item = this.lazyLinksVcRef.createComponent(this.cfr.resolveComponentFactory(LinksComponent));
            item.instance.formVariables = this.formVariables;
            item.instance.showLinks = this.showLinks;
        }, 100);
    }
}

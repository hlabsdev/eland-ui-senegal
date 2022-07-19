import { AlertService } from '@app/core/layout/alert/alert.service';
import { SourceService } from '@app/core/services/source.service';
import { ApplicationService } from '@app/core/services/application.service';
import { UserService } from '@app/core/services/user.service';
import { Variables } from '@app/core/models/variables.model';
import { Source } from '@app/core/models/source.model';
import { User } from '@app/core/models/user.model';
import {
    Component,
    OnInit,
    Input,
    EventEmitter,
    Output,
    ViewChild,
    AfterViewInit,
    ChangeDetectorRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { BAUnit } from './baUnit.model';
import { FormTemplateBaseComponent } from '@app/workstation/baseForm/form-template-base.component';
import { BAUnitService } from './baUnit.service';
import * as _ from 'lodash';
import { map, switchMap } from 'rxjs/operators';
import { of, combineLatest } from 'rxjs';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { NgForm } from '@angular/forms';
import { SpatialUnitTypes } from '@app/workstation/spatialUnit/spatialUnitType.model';

@Component({
    selector: 'app-ba-unit',
    template: `
        <app-ba-unit-form
            [baUnit]="baUnit"
            [formVariables]="formVariables"
            [currentSurface]="baUnit ? baUnit.currentSurface() : '00ha00a00ca'"
            [nextSlipNumber]="baUnit ? baUnit.nextSlipNumber() : 0"
            (cancelButtonClicked)="cancel($event)"
            (saveButtonClicked)="save($event)"
            (suggestedTitleIdButtonClicked)="suggestedTitleId($event)"
        ></app-ba-unit-form>
    `,
})
export class BAUnitComponent extends FormTemplateBaseComponent implements AfterViewInit, OnInit {
    @ViewChild('form', { read: NgForm }) form: any;
    @Input() formVariables: FormVariables = new FormVariables({});
    @Output() saved = new EventEmitter<{ baUnit: BAUnit; variable: Variables }>();
    @Output() canceled = new EventEmitter<BAUnit>();

    baUnit: BAUnit;
    accessedByRouter: boolean;
    baUnitSources: Source[];
    user: User;

    constructor(
        protected router: Router,
        protected location: Location,
        protected baUnitService: BAUnitService,
        protected route: ActivatedRoute,
        protected alertService: AlertService,
        protected sourceService: SourceService,
        private changeDetector: ChangeDetectorRef,
        private applicationService: ApplicationService,
        protected userService: UserService,
    ) {
        super();
        this.user = this.userService.getCurrentUser();
    }

    ngOnInit(): void {
        combineLatest([this.route.params, this.route.queryParams])
            .pipe(
                map(([params, queryParams]) => ({
                    baUnitId: params && params.baUnitId,
                    isRegistered: queryParams && queryParams.registered,
                })),
            )
            .pipe(
                switchMap(({ baUnitId, isRegistered }) => {
                    this.accessedByRouter = this.router.url.includes('ba-unit');
                    const baunit = this.formVariables.baUnit ? this.formVariables.baUnit : new BAUnit();
                    const baunitid = baUnitId ? baUnitId : this.getBaUnitId(baunit);
                    return baunitid
                        ? this.baUnitService.getBAUnit(new BAUnit({ uid: baunitid }), { isRegistered })
                        : of(baunit);
                }),
            )
            .subscribe(
                (baUnit) => {
                    this.baUnit = baUnit;
                    if (
                        !this.baUnit.responsibleOffice &&
                        this.formVariables.application &&
                        this.formVariables.application.responsibleOffice
                    ) {
                        this.baUnit.responsibleOffice = this.formVariables.application.responsibleOffice;
                    }
                },
                (err) => this.alertService.apiError(err),
            );
    }

    ngAfterViewInit(): void {
        this.changeDetector.detectChanges();
    }

    save(baUnit: BAUnit) {
        if (!_.isEmpty(this.formVariables.sources)) {
            this.sourceService.getSourcesByIds(this.formVariables.sources).subscribe((source) => {
                if (_.isEmpty(baUnit.sources)) {
                    baUnit.sources = source;
                } else {
                    const newSources = source.filter((val) => !baUnit.sources.map((s) => s.id).includes(val.id));
                    baUnit.sources = baUnit.sources.concat(newSources);
                }
                this.addBAUnit(baUnit);
            });
        } else {
            this.addBAUnit(baUnit);
        }
    }

    async addBAUnit(baUnit) {
        baUnit = new BAUnit(baUnit);
        const baUnitPersistedToLadm = !this.formVariables.saveToLadm && this.baUnit.uid && !this.baUnit.isAdministrator;

        if (baUnitPersistedToLadm) {
            this.alertService.error('API_MESSAGES.MUST_PERSIST_ON_LADM');
            return;
        }

        if (!this.formVariables.saveToLadm && !this.baUnit.isAdministrator) {
            const saveVariable: any = {
                baUnit: this.baUnit,
                variable: {
                    baUnit: { value: JSON.stringify(baUnit), type: 'Json' },
                },
            };

            if (
                this.formVariables.baUnit.spatialUnits.length === 1 &&
                this.formVariables.baUnit.spatialUnits[0].spatialUnitType === SpatialUnitTypes.PARCEL
            ) {
                saveVariable.variable = {
                    ...saveVariable.variable,
                    NICAD: {
                        value: this.formVariables.baUnit.spatialUnits[0].parcelNumber,
                        type: 'String',
                    },
                };
            }

            this.saved.emit(saveVariable);
            return;
        }

        baUnit.modDate = new Date();
        baUnit.modUser = this.user.username;

        const saveObs = baUnit.uid
            ? this.baUnitService.updateBAUnit({
                  baUnit,
                  baUnitFormFieldsRequired: this.formVariables.baUnitFormFieldsRequired,
              })
            : this.baUnitService.createBAUnit({
                  baUnit,
                  baUnitFormFieldsRequired: this.formVariables.baUnitFormFieldsRequired,
              });

        saveObs.subscribe(
            async (u) => {
                this.alertService.success('API_MESSAGES.SAVE_SUCCESSFUL');
                this.baUnit = u;

                if (this.formVariables.applicationId) {
                    await this.updateApplication();
                }

                const saveValue: any = {
                    baUnit: this.baUnit,
                    variable: {
                        baUnit: { value: JSON.stringify(u), type: 'Json' },
                        titleNumber: { value: this.baUnit.getTitle(), type: 'String' },
                    },
                };

                if (
                    this.baUnit.spatialUnits.length === 1 &&
                    this.baUnit.spatialUnits[0].spatialUnitType === SpatialUnitTypes.PARCEL
                ) {
                    saveValue.variable = {
                        ...saveValue.variable,
                        NICAD: {
                            value: this.baUnit.spatialUnits[0].parcelNumber,
                            type: 'String',
                        },
                    };
                }

                this.saved.emit(saveValue);
                this.goToList();
            },
            (err) => this.alertService.apiError(err),
        );
    }

    cancel(baUnitBackup: BAUnit): void {
        _.merge(this.baUnit, baUnitBackup);
        this.canceled.emit(this.baUnit);
        this.goToList();
    }

    goToList() {
        if (this.accessedByRouter) {
            this.location.back();
        }
    }

    suggestedTitleId(baUnit: BAUnit) {
        if (baUnit.registryRecord.registry) {
            const registryObs = this.baUnitService.getNextAvailableRegistryRecordId(baUnit);
            registryObs.subscribe(
                (registryRecord) => {
                    if (this.baUnit.registryRecord.id) {
                        registryRecord.id = this.baUnit.registryRecord.id;
                    }
                    this.baUnit.registryRecord = registryRecord;
                },
                (err) => this.alertService.apiError(err),
            );
        }
    }

    getBaUnitId(baunit: BAUnit) {
        if (baunit.uid) {
            return baunit.uid;
        } else if (this.formVariables.baUnitId) {
            return this.formVariables.baUnitId;
        } else {
            return null;
        }
    }

    async updateApplication() {
        return new Promise((resolve, reject) => {
            this.applicationService.getApplication(this.formVariables.applicationId.toString()).subscribe(
                (application) => {
                    application.baUnitId = this.baUnit.uid;
                    application.baUnitVersion = this.baUnit.version;
                    this.applicationService.updateApplication(application).subscribe((app) => resolve(app));
                },
                (err) => reject(err),
            );
        });
    }
}

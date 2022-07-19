import { SpatialUnit } from './spatialUnit.model';
import { SpatialUnitTypes } from './spatialUnitType.model';
import {
    Component,
    AfterViewInit,
    Input,
    Output,
    EventEmitter,
    SimpleChanges,
    OnChanges,
    SimpleChange,
    ChangeDetectorRef,
    ViewChild,
    OnInit,
    OnDestroy,
} from '@angular/core';
import { FormTemplateBaseComponent } from '@app/workstation/baseForm/form-template-base.component';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import Utils from '@app/core/utils/utils';
import { Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { DynamicFormComponent } from '@app/core/layout/elements/dynamic-form/dynamic-form.component';
import { ErrorResult } from '@app/core/utils/models/errorResult.model';
import { UtilService } from '@app/core/utils/util.service';
import { ValidationService } from '@app/core/utils/validation.service';
import { FieldConfig } from '@app/core/models/field.model';
import { GisComponent } from '@app/workstation/gis/gis.component';
import { Router } from '@angular/router';
import { findIndex, get, isEmpty, remove } from 'lodash';

@Component({
    selector: 'app-spatial-unit-form',
    template: `
        <dynamic-form
            [readOnly]="readOnly"
            [fields]="config"
            [errorMessage]="errorMessage"
            [title]="title"
            (submit)="save($event)"
            [fieldValues]="fieldValues"
            [saveToLadm]="true"
            [noTopBar]="noTopBar"
            (cancelButtonClicked)="cancel()"
        >
        </dynamic-form>

        <app-spatial-units
            *ngIf="isParcelWithBuilding && formVariables"
            [showBuildingPicker]="true"
            [formVariables]="formVariables"
            [parcelBuildings]="spatialUnit.buildings"
            [listTitle]="buildingListTitle"
            (spatialUnitPickerSave)="addBuildingSubParcel($event)"
            (spatialUnitPickerDelete)="deleteBuildingFromSubParcel($event)"
        ></app-spatial-units>

        <!-- gis integration  -->
        <app-gis
            *ngIf="isShowMap"
            [formVariables]="formVariables"
            [isSpatialUnit]="true"
            [parcelNICAD]="this.form.form.get('parcelNumber').value || this.formVariables.arcGIS.NICAD"
            (mapClicked)="mapClickedInGis($event)"
        >
        </app-gis>
        <!-- gis integration  -->
    `,
})
export class SpatialUnitFormComponent
    extends FormTemplateBaseComponent
    implements AfterViewInit, OnChanges, OnInit, OnDestroy
{
    @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

    @Input() spatialUnit: SpatialUnit;
    @Input() config: FieldConfig[];
    @Input() errorMessage: string;
    @Input() readOnly = false;
    @Input() formVariables: FormVariables;
    @Input() noTopBar = false;

    @Output() saveButtonClicked = new EventEmitter<SpatialUnit>();
    @Output() cancelButtonClicked = new EventEmitter<boolean>();
    @Output() reloadData = new EventEmitter();

    title: string;
    fieldValues: any;
    areaFieldValue: number;
    areaUnitFieldValue: any;
    valueChanges: Subscription;
    spatialUnitTypeValueChanges: Subscription;
    buildingOnParcelValueChanges: Subscription;
    buildingAsPartOfParcelValueChanges: Subscription;
    isParcelWithBuilding = false;
    buildingListTitle = 'SPATIAL_UNIT.TITLE_BUILDING_LIST';

    // gis integration [
    isShowMap = false;
    @ViewChild(GisComponent) gis: GisComponent;
    parcelNumber: string;
    isBaUnit = false;
    // gis integration ]

    constructor(
        private changeDetector: ChangeDetectorRef,
        public validationService: ValidationService,
        public utilService: UtilService,
        public alertService: AlertService,
        protected router: Router,
    ) {
        super();
    }

    ngOnInit(): void {
        this.title = this.spatialUnit.suid ? 'SPATIAL_UNIT.TITLE_EDIT' : 'SPATIAL_UNIT.TITLE_ADD';
        this.areaFieldValue = this.spatialUnit.area.areaSize;
        this.areaUnitFieldValue = this.spatialUnit.area.measureUnit;

        // gis integration [
        this.isBaUnit = this.router.url.includes('ba-unit');
        // gis integration ]
    }

    ngOnDestroy(): void {
        if (this.spatialUnitTypeValueChanges) {
            this.spatialUnitTypeValueChanges.unsubscribe();
        }
        if (this.buildingOnParcelValueChanges) {
            this.buildingOnParcelValueChanges.unsubscribe();
        }
        if (this.buildingAsPartOfParcelValueChanges) {
            this.buildingAsPartOfParcelValueChanges.unsubscribe();
        }
        if (this.valueChanges) {
            this.valueChanges.unsubscribe();
        }
        this.saveButtonClicked.unsubscribe();
        this.saved.unsubscribe();
        this.cancelButtonClicked.unsubscribe();
        this.canceled.unsubscribe();
        this.clickedEvent.unsubscribe();
        this.reloadData.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.setReadOnlyFields();
        this.setParentReadOnlyFields();
        this.fieldValues = this.spatialUnit;
        this.setConfigs(this.spatialUnit.spatialUnitType);
        this.setBuildingPicker();
        this.spatialUnitTypeValueChanges = this.form.form
            .get('spatialUnitType')
            .valueChanges.subscribe((fieldChange: any) => {
                if (fieldChange) {
                    // gis integration [
                    if (fieldChange === SpatialUnitTypes.PARCEL) {
                        this.isShowMap = true;
                    } else {
                        this.isShowMap = false;
                    }
                    // gis integration ]
                    this.setConfigs(fieldChange);
                }
                this.setBuildingPicker('spatialUnitType', fieldChange);
            });

        if (this.form.form.get('buildingOnParcel')) {
            this.buildingOnParcelValueChanges = this.form.form
                .get('buildingOnParcel')
                .valueChanges.subscribe((buildingOnParcel: any) => {
                    this.setBuildingPicker('buildingOnParcel', buildingOnParcel);
                });
        }

        if (this.form.form.get('buildingAsPartOfParcel')) {
            this.buildingAsPartOfParcelValueChanges = this.form.form
                .get('buildingAsPartOfParcel')
                .valueChanges.subscribe((buildingAsPartOfParcel: any) => {
                    this.setBuildingPicker('buildingAsPartOfParcel', buildingAsPartOfParcel);
                });
        }

        if (this.form.form.controls['area.areaSize']) {
            const pattern = Utils.getAreaValidator(
                this.spatialUnit.area.measureUnit && this.spatialUnit.area.measureUnit.value,
            );
            this.form.form.controls['area.areaSize'].setValidators(Validators.pattern(pattern));
            this.form.form.controls['area.areaSize'].updateValueAndValidity();
        }

        this.valueChanges = this.form.form.valueChanges.subscribe((changes: any) => {
            const areaFieldChange = get(changes, 'area.areaSize', null);
            const areaUnitFieldChange = get(changes, 'area.measureUnit', null);
            const isAreaChanged = areaFieldChange !== this.areaFieldValue;
            const isAreaUnitChanged = areaUnitFieldChange !== this.areaUnitFieldValue;

            if (areaFieldChange && areaUnitFieldChange && this.areaUnitFieldValue && isAreaUnitChanged) {
                const area = Utils.convertAreaValue(
                    areaFieldChange,
                    this.areaUnitFieldValue.value,
                    areaUnitFieldChange.value,
                );
                this.areaUnitFieldValue = areaUnitFieldChange;
                this.form.form.controls['area.areaSize'].setValidators(
                    Validators.pattern(Utils.getAreaValidator(areaUnitFieldChange.value)),
                );
                this.form.form.controls['area.areaSize'].setValue(area);
            }

            if (isAreaChanged || (this.areaFieldValue && isAreaUnitChanged)) {
                this.setAreaRepresentation(areaFieldChange, areaUnitFieldChange);

                if (this.formVariables.baUnit.version === 0 && !this.formVariables.baUnit.registered) {
                    this.areaFieldValue = areaFieldChange;
                    this.areaUnitFieldValue = areaUnitFieldChange;

                    if (this.form.form.controls['area.initialAreaSize']) {
                        const initialAreaValue = areaFieldChange;
                        this.form.form.controls['area.initialAreaSize'].setValue(initialAreaValue);
                        this.form.form
                            .get('initialAreaRepresentation')
                            .setValue(this.form.form.get('areaRepresentation').value);
                    }
                }
            }
        });
        this.reloadData.emit();

        // gis integration [
        if (this.formVariables.arcGIS.parcelArea !== undefined) {
            this.form.form.controls['area.areaSize'].setValue(this.formVariables.arcGIS.parcelArea);
        }
        // gis integration ]
        this.changeDetector.detectChanges();
    }

    setConfigs(spatialUnitType) {
        this.isShowMap = false;

        let enabledGroups = ['SPATIAL_UNIT'];
        if (spatialUnitType) {
            if (spatialUnitType === SpatialUnitTypes.BUILDING) {
                enabledGroups = ['SPATIAL_UNIT', 'BUILDING'];
            } else if (spatialUnitType === SpatialUnitTypes.PARCEL) {
                this.isShowMap = true;

                if (this.spatialUnit.parent) {
                    enabledGroups = ['SPATIAL_UNIT', 'PARCELS', 'PARENT_PARCEL'];
                } else {
                    enabledGroups = ['SPATIAL_UNIT', 'PARCELS'];
                }
            } else if (spatialUnitType === SpatialUnitTypes.LEGAL_UTILITY) {
                enabledGroups = ['SPATIAL_UNIT'];
            }
        }
        this.config = this.config.map((item) => {
            item.isEnabled(enabledGroups);
            return item;
        });
    }

    setBuildingPicker(fieldChangeName = null, fieldChangeValue: any = null) {
        let spatialUnitType = '';
        let buildingOnParcel = false;
        let buildingAsPartOfParcel = false;
        this.isParcelWithBuilding = false;

        if (!fieldChangeValue) {
            spatialUnitType = this.spatialUnit.spatialUnitType;
            buildingOnParcel = this.spatialUnit.buildingOnParcel ? this.spatialUnit.buildingOnParcel.valueOf() : false;
            buildingAsPartOfParcel = this.spatialUnit.buildingAsPartOfParcel
                ? this.spatialUnit.buildingAsPartOfParcel.valueOf()
                : false;
        } else {
            if (fieldChangeName === 'spatialUnitType') {
                spatialUnitType = fieldChangeValue;
            } else {
                spatialUnitType = this.form.form.get('spatialUnitType').value;
            }

            if (fieldChangeName === 'buildingOnParcel') {
                buildingOnParcel = fieldChangeValue;
            } else {
                buildingOnParcel = this.form.form.get('buildingOnParcel')
                    ? this.form.form.get('buildingOnParcel').value
                    : false;
            }

            if (fieldChangeName === 'buildingAsPartOfParcel') {
                buildingAsPartOfParcel = fieldChangeValue;
            } else {
                buildingAsPartOfParcel = this.form.form.get('buildingAsPartOfParcel')
                    ? this.form.form.get('buildingAsPartOfParcel').value
                    : false;
            }
        }

        if (spatialUnitType === SpatialUnitTypes.PARCEL) {
            if (this.spatialUnit.parent && (buildingOnParcel || buildingAsPartOfParcel)) {
                this.isParcelWithBuilding = true;
            }
        }
    }

    setAreaRepresentation(areaFieldChange: number, areaUnitFieldChange: any) {
        this.areaFieldValue = areaFieldChange;
        this.areaUnitFieldValue = areaUnitFieldChange;

        if (!areaFieldChange || !areaUnitFieldChange) {
            areaFieldChange = null;
        }

        if (this.form.form.get('areaRepresentation')) {
            const areaUnit = areaUnitFieldChange ? areaUnitFieldChange.value : null;
            const areaRepresentationValue = Utils.getAreaRepresentation(areaFieldChange, areaUnit);

            this.form.form.get('areaRepresentation').setValue(areaRepresentationValue);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        const error: SimpleChange = changes.errorMessage;
        if (error && error.currentValue) {
            this.errorMessage = error.currentValue;
        }
    }

    save(spatialUnit: SpatialUnit) {
        if (!this.validateParcelLimits()) {
            this.errorMessage = new ErrorResult('MESSAGES.LIMITES_REQUIRED').toMessage();
            return;
        }
        this.config.filter((item) => item.disabled).forEach((item) => this.spatialUnit[item.name] == null);
        Object.keys(spatialUnit).forEach((key) => (this.spatialUnit[key] = spatialUnit[key]));
        this.saveButtonClicked.emit(this.spatialUnit);
    }

    cancel() {
        this.fieldValues = this.spatialUnit;
        this.cancelButtonClicked.emit(true);
        this.errorMessage = null;
    }

    hideMainParcelCheckBox() {
        const index = findIndex(this.config, (item) => item.name === 'mainParcel');
        if (index > -1) {
            this.config.splice(index, 1);
        }
    }

    setReadOnlyFields() {
        if (this.spatialUnit.suid) {
            this.config.find((item) => item.name === 'spatialUnitType').readOnly = true;
        }
    }

    setParentReadOnlyFields() {
        if (this.spatialUnit.parent) {
            this.config.find((item) => item.name === 'spatialUnitType').readOnly = true;
            this.config.find((item) => item.name === 'parentParcel').readOnly = true;
            this.config.find((item) => item.name === 'division').readOnly = true;
            this.config.find((item) => item.name === 'district').readOnly = true;

            this.hideMainParcelCheckBox();
        }
    }

    addBuildingSubParcel(building: any) {
        const parcelWithBuilding = this.spatialUnit.buildings.filter((su) => su.suid === building.suid);
        if (isEmpty(parcelWithBuilding)) {
            this.spatialUnit.buildings.push(building);
        }
    }

    deleteBuildingFromSubParcel(spatialUnit: any) {
        remove(this.spatialUnit.buildings, (su) => su === spatialUnit);
    }

    validateParcelLimits(): boolean {
        let isValid = true;
        if (this.spatialUnit.spatialUnitType === SpatialUnitTypes.PARCEL) {
            if (this.spatialUnit.cardinalPoints.length < 3) {
                isValid = false;
            } else {
                for (let i = 0; i < this.spatialUnit.cardinalPoints.length; i++) {
                    const obj = this.spatialUnit.cardinalPoints[i];
                    if ((typeof obj === 'string' && isEmpty(obj)) || (typeof obj === 'object' && isEmpty(obj.point))) {
                        isValid = false;
                        break;
                    }
                }
            }
        }
        return isValid;
    }

    mapClickedInGis(attributes: any): void {
        this.form.form.get('parcelNumber').setValue(attributes.nicad);
        this.form.form.controls['area.areaSize'].setValue(Math.ceil(attributes.Shape__Area));
        this.form.form.controls['area.measureUnit'].setValue(
            this.config.find((item) => item.name === 'area.measureUnit').options[2].value,
        );
    }
}

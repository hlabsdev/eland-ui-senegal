import { ParametersService } from '@app/admin/parameters/parameters.service';
import { DataService } from '@app/data/data.service';
import { SpatialUnit } from './spatialUnit.model';
import { SpatialUnitTypes } from '@app/workstation/spatialUnit/spatialUnitType.model';
import { SpatialUnitService } from './spatialUnit.service';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { ValidationService } from '@app/core/utils/validation.service';
import { FormService } from '@app/core/services/form.service';
import { UtilService } from '@app/core/utils/util.service';
import { SelectService } from '@app/core/layout/elements/select/select.service';
import { UserService } from '@app/core/services/user.service';
import { FieldConfig } from '@app/core/models/field.model';
import { ProcessTypes } from '@app/core/models/process.model';
import { User } from '@app/core/models/user.model';
import { Component, OnInit, Input, EventEmitter, Output, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import * as _ from 'lodash';
import { of, forkJoin, Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RegistryService } from '@app/core/services/registry.service';
import { TranslateService } from '@ngx-translate/core';
import { FormVariables } from '../baseForm/formVariables.model';
import { BAUnit } from '@app/workstation/baUnit/baUnit.model';
import { SelectItem } from 'primeng/api';
import Utils from '@app/core/utils/utils';
import { District } from '@app/core/models/territory/district.model';
import { Division } from '@app/core/models/territory/division.model';
import { Circle } from '@app/core/models/territory/circle.model';
import { Region } from '@app/core/models/territory/region.model';
import { Registry } from '@app/core/models/registry.model';
import { SpatialUnitFormComponent } from './spatialUnit.form.component';

@Component({
    selector: 'app-spatial-unit',
    template: `
        <app-spatial-unit-form
            *ngIf="spatialUnit && formConfig && finishLoad"
            [spatialUnit]="spatialUnit"
            [readOnly]="readOnly"
            [config]="formConfig"
            [formVariables]="formVariables"
            [errorMessage]="errorMessage"
            [noTopBar]="noTopBar"
            (cancelButtonClicked)="canceled.emit($event)"
            (saveButtonClicked)="save($event)"
            (reloadData)="reloadData()"
        >
        </app-spatial-unit-form>
    `,
})

// [readOnly]="readOnly"
export class SpatialUnitComponent implements OnInit, OnDestroy {
    @Input() id: string;
    @Input() persistToDB: boolean;
    @Input() spatialUnit: SpatialUnit;
    @Input() baUnit: BAUnit;
    @Input() readOnly = false;
    @Input() spatialUnitUrl = false;
    @Input() isNewRegister = true;
    @Input() skipGetSpatialUnit = false;
    @Input() noTopBar = false;

    @Output() saved = new EventEmitter<SpatialUnit>();
    @Output() canceled = new EventEmitter<SpatialUnit>();
    @Output() dataLoad = new EventEmitter<true>();

    @Input() formVariables: FormVariables = new FormVariables({});

    @ViewChild(SpatialUnitFormComponent) form: SpatialUnitFormComponent;

    formConfig: FieldConfig[];
    errorMessage: string;
    selectedRegionExt: any;
    areaHectares = 0;
    subscription: Subscription;

    districts: District[];
    divisions: Division[];
    division: Division;
    circles: Circle[];
    circle: Circle;
    regions: Region[];
    region: Region;
    finishLoad = false;
    buildingSelectionListTitle = 'SPATIAL_UNIT.TITLE_BUILDING_LIST';
    user: User;
    registryFilter: Registry;

    constructor(
        protected router: Router,
        protected location: Location,
        protected spatialUnitService: SpatialUnitService,
        protected route: ActivatedRoute,
        protected alertService: AlertService,
        protected formService: FormService,
        protected utilService: UtilService,
        protected validationService: ValidationService,
        protected registryService: RegistryService,
        private selectService: SelectService,
        private translateService: TranslateService,
        protected userService: UserService,
        private parametersService: ParametersService,
        private dataService: DataService,
    ) {
        this.user = this.userService.getCurrentUser();

        this.subscription = selectService.select$.subscribe((data: any) => {
            if (
                data &&
                (data.name === 'district' ||
                    data.name === 'division' ||
                    data.name === 'spatialUnitType' ||
                    data.name === 'division' ||
                    data.name === 'circle' ||
                    data.name === 'region')
            ) {
                this.spatialUnit[data.name] = data.value ? data.value : null;
            }
            this.reloadTerritories().subscribe();
        });
    }

    ngOnInit() {
        const SPATIAL_UNIT = 'SPATIAL_UNIT_FORM';
        this.persistToDB = this.persistToDB ? this.persistToDB : this.spatialUnit.suid != null;
        this.dataService.getFormByName(SPATIAL_UNIT).subscribe((form) => {
            this.formConfig = this.utilService.getFormFieldConfig(form);
            this.loadTerritoriesData().subscribe((nada) => {
                forkJoin([
                    this.utilService.mapToSelectItems(
                        this.spatialUnitService.getSpatialUnitTypes(),
                        'SPATIAL_UNIT.TYPES',
                        'value',
                        'COMMON.ACTIONS.SELECT',
                    ),
                    this.formVariables.showCurrentVersion || !this.spatialUnit.suid || this.skipGetSpatialUnit
                        ? of(this.spatialUnit)
                        : this.spatialUnitService.getSpatialUnit(this.spatialUnit.suid),
                    this.reloadTerritories(),
                ]).subscribe(([spatialUnitTypes, spacialUnit, territories]) => {
                    this.finishLoad = true;

                    // gis integration
                    if (this.formVariables.arcGIS.processType !== ProcessTypes.division) {
                        this.spatialUnit = spacialUnit;
                    }
                    // gis integration

                    const registryCode = this.getRegistryBookCode();

                    const containsMainParcel = this.containsMainParcel();
                    const isSubParcel = this.isSubParcel(this.spatialUnit);
                    const mainParcelCheckBox = this.formConfig.find((item) => item.name === 'mainParcel');

                    if (this.spatialUnit.area.measureUnit) {
                        this.areaHectares = Utils.convertAreaToHectares(
                            Utils.parseFloat(this.spatialUnit.area.areaSize),
                            this.spatialUnit.area.measureUnit.value,
                        );
                    }
                    this.formConfig.find((item) => item.name === 'spatialUnitType').options = spatialUnitTypes;

                    if (isSubParcel) {
                        this.spatialUnit.mainParcel = false;
                    }

                    mainParcelCheckBox.readOnly = true;
                    if (containsMainParcel && !this.spatialUnit.mainParcel) {
                        if (!this.spatialUnit.parent && !this.spatialUnit.spatialUnitType) {
                            this.hideParcelOptionSpatialUnitTypes(spatialUnitTypes);
                        }
                        this.spatialUnit.mainParcel = false;
                    } else {
                        const mainParcel = this.formConfig.find((item) => item.name === 'mainParcel');
                        // Not quite sure this should be true by default when no main parcel is present
                        this.formConfig.find((item) => item.name === 'parcelIsRegistered').value = true;
                        mainParcel.readOnly = true;
                        mainParcel.value = true;
                    }

                    if ((containsMainParcel && this.spatialUnit.mainParcel !== true) || this.spatialUnit.parent) {
                        this.hideMainParcelCheckBox();
                        if (this.spatialUnit.parent) {
                            this.formConfig.find((item) => item.name === 'parentParcel').value =
                                this.spatialUnit.parent_parcelNumber;
                        }
                    }
                    this.setSpacialUnitRegistryBook();
                    this.dataLoad.emit(true);
                });
            });
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    reloadData() {
        this.reloadTerritories().subscribe();
    }

    save(spatialUnit: SpatialUnit): void {
        if (spatialUnit.parent) {
            let oldAreaHectares = 0;
            if (!this.isNewRegister) {
                oldAreaHectares = this.areaHectares;
            }
            const areaConsistencyValidationResult = this.spatialUnit.validateAreaConsistency(
                spatialUnit,
                this.formVariables.baUnit.spatialUnits,
                oldAreaHectares,
            );
            if (areaConsistencyValidationResult) {
                return (this.errorMessage = areaConsistencyValidationResult);
            }
        }

        spatialUnit.modDate = new Date();
        spatialUnit.modUser = this.user.username;

        if (this.spatialUnitUrl) {
            const saveObs = spatialUnit.suid
                ? this.spatialUnitService.updateSpatialUnit(spatialUnit)
                : this.spatialUnitService.createSpatialUnit(spatialUnit);

            if (this.persistToDB) {
                saveObs.subscribe(
                    (su) => {
                        this.spatialUnit = su;
                        this.saved.emit(su);
                        this.saveSuccess(true);
                    },
                    (err) => this.alertService.apiError(err),
                );
            } else {
                this.saved.emit(spatialUnit);
            }
        } else {
            this.saved.emit(spatialUnit);
        }
    }

    saveSuccess(triggerMessage = false): void {
        if (triggerMessage) {
            this.alertService.success('API_MESSAGES.SAVE_SUCCESSFUL');
        }
        this.canceled.emit(this.spatialUnit);
        this.spatialUnit = null;
    }

    getDivisionFilter(
        divisions: Division[],
        options: { registryCode?: string; ids?: string[]; id?: string },
    ): { filtered: Division[]; circleIds: string[]; filteredIds: string[] } {
        const filteredDivisions = _.filter(
            divisions,
            (division) =>
                _.filter(division.registries, (registry) => {
                    if (options && options.registryCode) {
                        return registry.code === options.registryCode;
                    } else if (options && options.ids) {
                        return options.ids.includes(registry.id);
                    } else {
                        return true;
                    }
                }).length > 0,
        );
        return {
            filtered: filteredDivisions,
            circleIds: _.uniq(filteredDivisions.map((division) => division.circle.id)),
            filteredIds: this.getMapIds(filteredDivisions),
        };
    }

    getCommonFilterWithNext(items: any[], ids: string[] = [], next: string): { filtered: any[]; nextIds: string[] } {
        const filtered = this.getFilterIdsIncluded(items, ids);
        return { filtered, nextIds: _.uniq(filtered.map((item) => item[next])) };
    }

    getMapIds(items: any[]): string[] {
        return items.map((item) => item.id);
    }
    getMapField(items: any[], field: string): string[] {
        return items.map((item) => _.get(item, field));
    }

    getFilterIdsIncluded(items: any[], filters: any[]): any[] {
        return this.getFilterIncludeFilterItem(items, filters, 'id');
    }

    getFilterIdIncluded(items: any[], filter: string): any[] {
        return this.getFilterIncludeFilterItem(items, [filter], 'id');
    }

    getFilterIncludeFilterItem(items: any[], filters: any[], itemFilter: string): any[] {
        return _.filter(items, (item) => filters.includes(_.get(item, itemFilter)));
    }

    getMapSelectItem(items: any[]): SelectItem[] {
        return items.map((item) => item.toSelectItem());
    }

    getMapsSelectItem(items: {
        regions?: Region[];
        circles?: Circle[];
        divisions?: Division[];
        districts?: District[];
    }): { regions?: SelectItem[]; circles?: SelectItem[]; divisions?: SelectItem[]; districts?: SelectItem[] } {
        const itemsToReturn = {};
        _.map(items, (item, k) => (itemsToReturn[k] = this.getMapSelectItem(item)));
        return itemsToReturn;
    }

    reloadTerritories() {
        return this.loadTerritoriesData().pipe(
            map(([regions, circles, divisions, districts]) => {
                const registryCode = this.getRegistryBookCode();
                let options: {
                    divisions?: Division[];
                    circles?: Circle[];
                    regions?: Region[];
                    districts?: District[];
                } = {};

                if (
                    this.spatialUnit &&
                    (this.spatialUnit.district ||
                        this.spatialUnit.division ||
                        this.spatialUnit.circle ||
                        this.spatialUnit.region)
                ) {
                    if (this.spatialUnit.district) {
                        options.districts = this.getFilterIdIncluded(districts, this.spatialUnit.district.id);
                        options.divisions = this.getFilterIdsIncluded(
                            divisions,
                            this.getMapField(options.districts, 'division.id'),
                        );
                        options.circles = this.getFilterIdsIncluded(
                            circles,
                            this.getMapField(options.divisions, 'circle.id'),
                        );
                        options.regions = this.getFilterIdsIncluded(
                            regions,
                            this.getMapField(options.circles, 'region.id'),
                        );
                    } else if (this.spatialUnit.division) {
                        options.divisions = this.getFilterIdIncluded(divisions, this.spatialUnit.division.id);
                        options.circles = this.getFilterIdsIncluded(
                            circles,
                            this.getMapField(options.divisions, 'circle.id'),
                        );
                        options.regions = this.getFilterIdsIncluded(
                            regions,
                            this.getMapField(options.circles, 'region.id'),
                        );
                        options.districts = this.getFilterIncludeFilterItem(
                            districts,
                            this.getMapIds(options.divisions),
                            'division.id',
                        );
                    } else if (this.spatialUnit.circle) {
                        options.circles = this.getFilterIdIncluded(circles, this.spatialUnit.circle.id);
                        options.regions = this.getFilterIdIncluded(regions, this.spatialUnit.circle.region.id);
                        options.divisions = this.getFilterIncludeFilterItem(
                            divisions,
                            this.getMapIds(options.circles),
                            'circle.id',
                        );
                        options.districts = this.getFilterIncludeFilterItem(
                            districts,
                            this.getMapIds(options.divisions),
                            'division.id',
                        );
                    } else if (this.spatialUnit.region) {
                        options.regions = this.getFilterIdIncluded(regions, this.spatialUnit.region.id);
                        options.circles = this.getFilterIncludeFilterItem(
                            circles,
                            this.getMapIds(options.regions),
                            'region.id',
                        );
                        options.divisions = this.getFilterIncludeFilterItem(
                            divisions,
                            this.getMapIds(options.circles),
                            'circle.id',
                        );
                        options.districts = this.getFilterIncludeFilterItem(
                            districts,
                            this.getMapIds(options.divisions),
                            'division.id',
                        );
                    }
                } else if (registryCode) {
                    const filteredDivisions = this.getDivisionFilter(divisions, { registryCode });
                    const filteredCircles = this.getCommonFilterWithNext(
                        circles,
                        filteredDivisions.circleIds,
                        'regionId',
                    );
                    const filteredRegions = this.getFilterIdsIncluded(regions, filteredCircles.nextIds);
                    const filteredDistricts = this.getFilterIncludeFilterItem(
                        districts,
                        filteredDivisions.filteredIds,
                        'divisionId',
                    );
                    options = {
                        regions: filteredRegions,
                        divisions: filteredDivisions.filtered,
                        circles: filteredCircles.filtered,
                        districts: filteredDistricts,
                    };
                } else {
                    options = { regions, divisions, circles, districts };
                }
                const optionsItem = this.getMapsSelectItem(options);
                this.setFormConfigOptions('region', optionsItem.regions);
                this.setFormConfigOptions('circle', optionsItem.circles);
                this.setFormConfigOptions('division', optionsItem.divisions);
                this.setFormConfigOptions('district', optionsItem.districts, this.spatialUnit.district);
            }),
        );
    }

    loadTerritoriesData(): Observable<[Region[], Circle[], Division[], District[]]> {
        const toLoad: Observable<any>[] = [];
        toLoad.push(
            !(this.regions && this.regions.length > 0)
                ? this.parametersService.getAllRegion(false).pipe(map((regions) => (this.regions = regions)))
                : of(this.regions),
        );
        toLoad.push(
            !(this.circles && this.circles.length > 0)
                ? this.parametersService.getAllCircle(false).pipe(map((circles) => (this.circles = circles)))
                : of(this.circles),
        );
        toLoad.push(
            !(this.divisions && this.divisions.length > 0)
                ? this.parametersService.getAllDivision(false).pipe(map((divisions) => (this.divisions = divisions)))
                : of(this.divisions),
        );
        toLoad.push(
            !(this.districts && this.districts.length > 0)
                ? this.parametersService.getAllDistrict(false).pipe(map((districts) => (this.districts = districts)))
                : of(this.districts),
        );
        return <Observable<[Region[], Circle[], Division[], District[]]>>forkJoin(toLoad);
    }

    getRegistryBookCode(): string {
        return this.spatialUnit && this.spatialUnit.registry ? this.spatialUnit.registry.code : null;
    }

    setSpacialUnitRegistryBook() {
        if (!this.spatialUnit.registryRecord) {
            if (this.formVariables.baUnit.registryRecord && this.formVariables.baUnit.registryRecord.registry) {
                this.spatialUnit.registry = this.formVariables.baUnit.registryRecord.registry;
            }
        }
    }

    setFormConfigValue(label: string, value: any, options: any[]) {
        if (value && options) {
            options.forEach((option) => {
                if (option.value.id === value.id) {
                    this.spatialUnit[label] = option.value;
                    this.formConfig.find((item) => item.name === label).value = option.value;
                    if (this.form && this.form.form && this.form.form.form && this.form.form.form.get(label)) {
                        this.form.form.form.get(label).setValue(option.value);
                    }
                }
            });
        }
    }
    setFormConfigOptions(label: string, values: any[], value?: any) {
        if (!!value) {
            this.setFormConfigValue(label, value, values);
        } else if (values.length === 1) {
            this.setFormConfigValue(label, values[0].value, values);
        }
        this.formConfig.find((item) => item.name === label).options = values;
        this.formConfig
            .find((item) => item.name === label)
            .options.unshift({ value: '', label: this.translateService.instant('COMMON.ACTIONS.SELECT') });
    }

    containsMainParcel() {
        return !_.isEmpty(this.formVariables.baUnit.spatialUnits.find((item) => item.mainParcel === true));
    }

    isSubParcel(spatialUnit: SpatialUnit): boolean {
        return !_.isNull(spatialUnit.parent) && spatialUnit.spatialUnitType === SpatialUnitTypes.PARCEL;
    }

    hideMainParcelCheckBox(): void {
        const index = _.findIndex(this.formConfig, (item) => item.name === 'mainParcel');
        if (index > -1) {
            this.formConfig.splice(index, 1);
        }
    }

    hideParcelOptionSpatialUnitTypes(spatialUnitTypes: SelectItem[]): void {
        const index = _.findIndex(spatialUnitTypes, (option) => option.value === SpatialUnitTypes.PARCEL);
        spatialUnitTypes.splice(index, 1);
    }
}

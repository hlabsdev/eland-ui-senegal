import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { ConsistencyChangeService } from '@app/workstation/consistencyChange/consistencyChange.service';
import { Parcel } from '@app/workstation/spatialUnit/parcel/parcel.model';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { CodeListService } from '@app/core/services/codeList.service';
import { TaskService } from '@app/core/services/task.service';
import { CodeListTypes, CodeListTypeEnum } from '@app/core/models/codeListType.model';
import { Task } from '@app/core/models/task.model';
import { BAUnit } from '@app/workstation/baUnit/baUnit.model';
import { map, mergeMap, toArray } from 'rxjs/operators';
import { BAUnitService } from '@app/workstation/baUnit/baUnit.service';
import { concat, forkJoin, Observable, of } from 'rxjs';
import { SpatialUnit } from '@app/workstation/spatialUnit/spatialUnit.model';
import {
    ConsistencyChange,
    ConsistencyChangeDragPanelItem,
    ConsistencyChangeGroup,
    ConsistencyChangeGroupAction,
} from '@app/core/models/consistencyChange.model';
import { DragElement } from '@app/core/layout/elements/drag-panels/drag-panels/drag-element';
import * as _ from 'lodash';
import { SpatialUnitService } from '@app/workstation/spatialUnit/spatialUnit.service';
import { ParcelSmall } from '@app/workstation/spatialUnit/parcel/parcelSmall.model';
import { DestinationOptions } from '@app/workstation/spatialUnit/spatialUnit-drag-panel.templates';

enum suMessages {
    'BAD_BA_UNIT' = 'BAD_BA_UNIT',
    'BA_UNIT_MUST_HAVE_A_MAIN_PARCEL_AND_NOT_BE_RADIATED' = 'BA_UNIT_MUST_HAVE_A_MAIN_PARCEL_AND_NOT_BE_RADIATED',
    'All_PARCELS_MUST_BE_MOVED' = 'All_PARCELS_MUST_BE_MOVED',
    'NO_NICADS_PROVIDED_OR_SUB_PARCEL' = 'NO_NICADS_PROVIDED_OR_SUB_PARCEL',
    'NO_NICADS_PROVIDED' = 'NO_NICADS_PROVIDED',
    'NO_BAUNIT_ID_PROVIDED' = 'NO_BAUNIT_ID_PROVIDED',
    'NO_SUB_PARCEL_PROVIDED' = 'NO_SUB_PARCEL_PROVIDED',
    'BAD_BA_UNIT_NO_SUB_PARCELS' = 'BAD_BA_UNIT_NO_SUB_PARCELS',
}

interface CCPanelOptions {
    parcels?: Parcel[];
    skipParcelPrincipal?: boolean;
    loadFromCC?: boolean;
}

@Component({
    selector: 'sog-spatial-unit-drag-panel',
    template: ` <sog-spatial-unit-drag-panel-form
            *ngIf="source && destinations"
            [source]="source"
            [destinations]="destinations"
            (save)="onSave($event)"
            [disabled]="disabled"
            [saving]="saving"
        ></sog-spatial-unit-drag-panel-form>
        <div *ngIf="!(source && destinations) && !stopped">{{ 'CONSISTENCY_CHANGE.LOADING_DATA' | translate }}</div>`,
})
export class SpatialUnitDragPanelComponent implements OnInit {
    constructor(
        private ccs: ConsistencyChangeService,
        private codeListService: CodeListService,
        private baUnitService: BAUnitService,
        private taskService: TaskService,
        private spatialUnitService: SpatialUnitService,
        private alertService: AlertService,
    ) {
        ConsistencyChangeGroup.setCodeListService(codeListService);
    }
    @Input() formVariables: FormVariables = new FormVariables({});
    @Input() task: Task;
    @Output() canceled = new EventEmitter<any>();
    @Output() saved = new EventEmitter<any>();
    error: any;
    saving: boolean;
    ccg: ConsistencyChangeGroup;
    source: ConsistencyChangeDragPanelItem;
    tSource: any;
    tDestinations: any;
    sourceCC: ConsistencyChange;
    sourceBaUnit: BAUnit;
    destinations: ConsistencyChangeDragPanelItem[];
    destinationsCC: ConsistencyChange[];
    destinationBaUnits: BAUnit[];
    disabled = false;
    stopped = false;
    generateTitleNumber = false;

    errorCheck = (() => {
        const baseValidation: { [name: string]: { fn: any; msg: suMessages } } = {};
        const base: any = {};

        baseValidation.baUnitVersion = {
            fn: (baUnit) => !baUnit || baUnit.version === null,
            msg: suMessages.BAD_BA_UNIT,
        };

        baseValidation.principalParcelHasRadiationDate = {
            fn: (baUnit) => baUnit.getPrincipalParcel().radiationDate !== null,
            msg: suMessages.BA_UNIT_MUST_HAVE_A_MAIN_PARCEL_AND_NOT_BE_RADIATED,
        };

        baseValidation.gotGeneratedNicads = {
            fn: (formVariables) => formVariables.generatedNicads,
            msg: suMessages.NO_NICADS_PROVIDED,
        };

        baseValidation.gotUseSubSpatialUnits = {
            fn: (formVariables) => formVariables.useSubSpatialUnits,
            msg: suMessages.NO_SUB_PARCEL_PROVIDED,
        };

        baseValidation.gotSubParcel = {
            fn: (subParcels) => !(subParcels && subParcels.length > 0),
            msg: suMessages.BAD_BA_UNIT_NO_SUB_PARCELS,
        };

        baseValidation.gotAtLeastGeneratedNicadsOrUseSubSpatialUnits = {
            fn: (formVariables) => !(formVariables.generatedNicads || formVariables.useSubSpatialUnits),
            msg: suMessages.BA_UNIT_MUST_HAVE_A_MAIN_PARCEL_AND_NOT_BE_RADIATED,
        };

        baseValidation.gotBaUnitId = {
            fn: (formVariables) => !(formVariables && formVariables.baUnitId),
            msg: suMessages.NO_BAUNIT_ID_PROVIDED,
        };

        base.checkGotErrors = (keysToCheck: { key: any; option?: any }[]) => {
            keysToCheck.forEach((element) => {
                if (element.key.fn(element.option)) {
                    this.stopped = true;
                    this.errorsHandler(element.key.msg);
                    return true;
                }
            });
            return false;
        };

        base.keys = baseValidation;

        return { ...base, ...baseValidation };
    })();

    createDestinations(destinationOptions: DestinationOptions) {
        this.destinations = [];
        this.destinationsCC.forEach((destination) => {
            if (destination.parcel) {
                let indexOfCurrentToRemove = -1;
                destinationOptions.subElements.forEach((subElement, ii) => {
                    if (destinationOptions.condition(subElement, destination)) {
                        indexOfCurrentToRemove = ii;
                    }
                });
                if (indexOfCurrentToRemove) {
                    destinationOptions.subElements.splice(indexOfCurrentToRemove, 1);
                }
            }
            this.destinations.push(this.createCCDragPanelItem(destination, { skipParcelPrincipal: true }));
        });
    }

    generateConsistencyChange(
        baUnit: BAUnit,
        ccg: ConsistencyChangeGroup,
        options: { subParcels?: Parcel[]; nicads?: ParcelSmall[] },
    ) {
        const isSubParcels = options.subParcels && options.subParcels.length > 0;
        const nbBaUnits = (isSubParcels ? options.subParcels.length : options.nicads.length) - 1;
        this.getNewBaUnits(baUnit, this.formVariables.newBaUnitIds, nbBaUnits).subscribe((newBaUnits) => {
            this.sourceCC = new ConsistencyChange(ccg.getSourceOrCreate(this.sourceBaUnit));

            this.destinationsCC = ccg
                .getDestinationsAndMapOrCreate([this.sourceBaUnit, ...newBaUnits])
                .map((destination) => new ConsistencyChange(destination));

            this.createDestinations(
                options.subParcels && options.subParcels.length > 0
                    ? {
                          subElements: options.subParcels,
                          condition: (subElement: Parcel, destination) => subElement.suid === destination.parcel.suid,
                      }
                    : {
                          subElements: options.nicads,
                          condition: (subElement, destination) =>
                              subElement.nicad === destination.parcel.maliParcelNumber,
                      },
            );
            let parcel$;
            if (!isSubParcels) {
                const newParcels: Parcel[] = options.nicads.map((smallParcel) =>
                    this.sourceBaUnit.getPrincipalParcel().cloneWithConsistencyChange(smallParcel),
                );

                parcel$ = forkJoin(newParcels.map((parcel) => this.spatialUnitService.createParcel(parcel)));
            } else {
                parcel$ = of(options.subParcels);
            }
            parcel$.subscribe((parcels) => {
                this.source = this.createCCDragPanelItem(this.sourceCC, { parcels });
            });
        });
    }
    generateConsistencyChangeFromCCg() {
        this.loadFromCcg();
        this.getBaUnits([...this.destinationsCC.map((destCC) => destCC.baUnitId)]).subscribe((gotBaUnits) => {
            _.forEach(this.destinationsCC, (destCC) => destCC.findAndSetBaUnit(gotBaUnits));
            this.sourceCC = this.sourceCC.findAndSetBaUnit(gotBaUnits);
            this.destinations = this.destinationsCC.map((destCC) =>
                this.createCCDragPanelItem(destCC, { loadFromCC: true }),
            );
            this.source = this.createCCDragPanelItem(this.sourceCC, { loadFromCC: true });
        });
    }

    ngOnInit() {
        const keys = this.errorCheck.keys;
        if (!this.errorCheck.checkGotErrors([{ key: keys.gotBaUnitId, option: this.formVariables }])) {
            forkJoin([
                this.getConsistencyChangeGroup(this.formVariables.consistencyChangeGroupId),
                this.getBaUnit(this.formVariables.baUnitId),
            ]).subscribe(([ccg, baUnit]) => {
                this.ccg = ccg;
                this.sourceBaUnit = baUnit;
                this.generateTitleNumber = this.formVariables.generateTitleNumber;
                if (
                    !this.errorCheck.checkGotErrors([
                        { key: keys.baUnitVersion, option: baUnit },
                        { key: keys.principalParcelHasRadiationDate, option: baUnit },
                        { key: keys.gotAtLeastGeneratedNicadsOrUseSubSpatialUnits, option: this.formVariables },
                    ])
                ) {
                    if (this.ccg.consistencyChanges && this.ccg.consistencyChanges.length > 0) {
                        this.generateConsistencyChangeFromCCg();
                    } else {
                        const subParcels = this.sourceBaUnit.getSubParcels();
                        if (
                            !(
                                this.formVariables.useSubSpatialUnits &&
                                this.errorCheck.checkGotErrors([{ key: keys.gotSubParcel, option: subParcels }])
                            )
                        ) {
                            this.generateConsistencyChange(
                                baUnit,
                                ccg,
                                this.formVariables.useSubSpatialUnits
                                    ? { subParcels }
                                    : { nicads: this.formVariables.generatedNicads },
                            );
                        }
                    }
                }
            });
        }
    }

    getCurrentCCDestinationFromId(parcelId: string): ConsistencyChange {
        return _.filter(this.destinationsCC, (dest) => dest.parcelSuid === parcelId)[0];
    }

    loadFromCcg() {
        this.destinationsCC = this.ccg.getDestinations();
        this.sourceCC = this.ccg.getSource();
    }

    reloadPanelsFromCcg() {
        this.source.consistencyChange = this.sourceCC;
        this.destinations = _.forEach(
            this.destinations,
            (destination) =>
                (destination.consistencyChange = this.getCurrentCCDestinationFromId(
                    destination.consistencyChange.parcelSuid,
                )),
        );
    }

    onSave({
        source,
        destinations,
    }: {
        source: ConsistencyChangeDragPanelItem;
        destinations: ConsistencyChangeDragPanelItem[];
    }) {
        if (!this.saving) {
            this.saving = true;
            let ccSource: ConsistencyChange;
            if (source.items.length === 1) {
                ccSource = source.consistencyChange.setParcel(source.items[0].base);
            } else {
                this.errorsHandler(suMessages.All_PARCELS_MUST_BE_MOVED);
                return;
            }

            let gotError = false;
            const ccDestinations: ConsistencyChange[] = [];
            destinations.forEach((destination) => {
                if (gotError) {
                    return;
                } else if (destination.items.length !== 1) {
                    this.errorsHandler(suMessages.All_PARCELS_MUST_BE_MOVED);
                    gotError = true;
                    return;
                } else {
                    ccDestinations.push(destination.consistencyChange.setParcel(destination.items[0].base));
                }
            });

            if (!gotError) {
                this.ccg.consistencyChanges = [ccSource, ...ccDestinations];
                this.ccs.ccg.update(this.ccg).subscribe(
                    (savedCcg) => {
                        this.ccg = savedCcg;
                        this.loadFromCcg();
                        this.reloadPanelsFromCcg();
                        this.saving = false;
                        this.alertService.success('MESSAGES.CC.SAVE_SUCCESS');
                    },
                    (error) => {
                        this.saving = false;
                        return this.alertService.apiError(error);
                    },
                );
            } else {
                this.saving = false;
            }
        }
    }

    getConsistencyChangeGroup = (id: string): Observable<ConsistencyChangeGroup> =>
        id
            ? this.ccs.ccg.get(id)
            : this.ccs.ccg.create(new ConsistencyChangeGroup({ action: ConsistencyChangeGroupAction.PARTITION })).pipe(
                  map((newCCG) => {
                      this.formVariables.consistencyChangeGroupId = newCCG.id;
                      this.putVariables('consistencyChangeGroupId', 'string', newCCG.id);
                      return newCCG;
                  }),
              );

    getBaUnit = (id: string): Observable<BAUnit> => (id ? this.baUnitService.getBAUnitById(id) : of(null));

    getBaUnits = (ids?: string[]): Observable<BAUnit[]> =>
        ids && ids.length > 0 ? forkJoin(ids.map((id) => this.getBaUnit(id))) : of(null);

    getCodeListByName = (type: CodeListTypeEnum, search: string) => this.codeListService.getCodeLists({ type, search });

    getBaUnit_MODE_PARTITION = () =>
        this.getCodeListByName(CodeListTypes.BA_UNIT_TYPE, 'BA_UNIT_CREATION_MODE_PARTITION').pipe(
            map((arr) => arr[0]),
        );

    createBaUnits = (baseBaUnit: BAUnit, nb: number) =>
        this.getBaUnit_MODE_PARTITION().pipe(
            mergeMap((MODE_PARTITION) => {
                const baunits$ = [];
                for (let i = 0; i < nb; i++) {
                    baunits$.push(
                        this.baUnitService.cloneBAUnit(this.sourceBaUnit, MODE_PARTITION, this.generateTitleNumber),
                    );
                }
                return concat(...baunits$)
                    .pipe(toArray())
                    .pipe(
                        map((nbus: BAUnit[]) => {
                            this.formVariables.newBaUnitIds = nbus.map((nbu) => nbu.uid);
                            this.putVariables('newBaUnitIds', 'Json', JSON.stringify(nbus.map((nbu) => nbu.uid)));
                            this.putVariables(
                                'baUnitIds',
                                'Json',
                                JSON.stringify([baseBaUnit, ...nbus].map((nbu) => nbu.uid)),
                            );
                            return nbus;
                        }),
                    );
            }),
        );

    getIds = (items: any[], subkey?: string) => items.map((item) => (subkey ? _.get(item, subkey) : item.id));

    updateBaUnit = (parcels: (Parcel | SpatialUnit)[], baUnit: BAUnit, parcelAsNew = false) =>
        this.baUnitService.updateBAUnit({
            baUnit: new BAUnit(baUnit).setSpatialUnits(parcels, parcelAsNew),
            baUnitFormFieldsRequired: false,
        });

    getNewBaUnits = (baseBaUnit, baUnitIds, nbNewBaUnits) =>
        baUnitIds && baUnitIds.length > 0 ? this.getBaUnits(baUnitIds) : this.createBaUnits(baseBaUnit, nbNewBaUnits);

    createCCDragPanelItem = (consistencyChange: ConsistencyChange, options: CCPanelOptions = {}) => {
        let items = [];
        if (options.loadFromCC) {
            items = [new DragElement(consistencyChange.parcel, consistencyChange.parcel.mainParcel)];
        } else {
            const mainParcel = consistencyChange.baUnit && consistencyChange.baUnit.getPrincipalParcel();
            const otherParcels = consistencyChange.baUnit && consistencyChange.baUnit.getNotMainParcel();
            if (mainParcel && !options.skipParcelPrincipal) {
                items = [...items, new DragElement(mainParcel, true)];
            }
            if (otherParcels && otherParcels.length > 0) {
                items = [...items, ...otherParcels.map((parcel) => new DragElement([parcel]))];
            }
            if (options.parcels) {
                items = [...items, ...options.parcels.map((parcel) => new DragElement(parcel))];
            }
        }
        return { consistencyChange, items, item: new DragElement(consistencyChange.baUnit) };
    };

    errorsHandler = (error: suMessages) => this.alertService.error(`MESSAGES.CC.${error}`);

    private putVariables = (varName, type, value) =>
        this.taskService.putTaskVariable(this.task, varName, { type, value }).subscribe();
    private putVariablesAsync = (varName, type, value) =>
        this.taskService.putTaskVariable(this.task, varName, { type, value });
}

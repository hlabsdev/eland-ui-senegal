import {
    Component,
    ComponentFactoryResolver,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { ConsistencyChange } from '../../core/models/consistencyChange.model';
import { FormVariables } from '../baseForm/formVariables.model';
import { BAUnit } from '../baUnit/baUnit.model';
import { Parcel } from '../spatialUnit/parcel/parcel.model';

@Component({
    selector: 'app-consistency-change-dialog',
    templateUrl: 'consistencyChangeDialog.component.html',
    styleUrls: ['consistencyChangeDialog.component.scss'],
})
export class ConsistencyChangeDialogComponent implements OnInit {
    @Input() currentCC: ConsistencyChange = new ConsistencyChange({});
    @Input() multiselect = false;
    @Output() saved = new EventEmitter();
    pBa_Unit_ID: string;
    currentBaUnit: BAUnit;
    pParcel_ID: string;

    @ViewChild('lazySpatialUnitPicker', { read: ViewContainerRef })
    private lazySpatialUnitPickerVcRef: ViewContainerRef;

    @ViewChild('lazyBaUnitPicker', { read: ViewContainerRef })
    private lazyBaUnitPickerVcRef: ViewContainerRef;

    constructor(private viewContainerRef: ViewContainerRef, private cfr: ComponentFactoryResolver) {}

    ngOnInit(): void {
        if (this.currentCC) {
            // make something with the currentCCG
            this.lazyLoadSpacialUnitPicker();
            this.lazyLoadBaUnitPicker();
        }
    }

    baUnitSave(e: any) {
        this.currentCC.baUnit = e.baUnit;
        this.lazyLoadSpacialUnitPicker();
    }
    spatialUnitSave(pParcels: Parcel | Parcel[]) {
        if (this.multiselect) {
            const currentCCS: ConsistencyChange[] = [];
            pParcels.forEach((parcel) => {
                currentCCS.push({
                    ...this.currentCC,
                    parcel,
                });
            });
            this.saved.emit(currentCCS);
        } else {
            this.currentCC.parcel = pParcels as Parcel;
            this.lazyLoadBaUnitPicker();
            this.saved.emit([this.currentCC]);
        }
    }

    async lazyLoadSpacialUnitPicker() {
        const { SpatialUnitPickerComponent } = await import('../spatialUnit/spatialUnitPicker.component');
        if (this.currentCC?.baUnit && !this.currentCC?.parcel) {
            setTimeout(() => {
                this.lazySpatialUnitPickerVcRef.clear();
                const application = this.lazySpatialUnitPickerVcRef.createComponent(
                    this.cfr.resolveComponentFactory(SpatialUnitPickerComponent),
                );
                application.instance.formVariables = new FormVariables({
                    isReadOnly: true,
                });
                application.instance.baUnit = this.currentCC.baUnit;
                application.instance.multiSelect = this.multiselect;
                application.instance.saved.subscribe(($event: any) => {
                    this.spatialUnitSave($event);
                });
            }, 100);
        }
    }

    async lazyLoadBaUnitPicker() {
        const { BAUnitPickerComponent } = await import('../baUnit/baUnitPicker.component');
        if (this.currentCC?.baUnit) {
            setTimeout(() => {
                this.lazyBaUnitPickerVcRef.clear();
                const baUnit = this.lazyBaUnitPickerVcRef.createComponent(
                    this.cfr.resolveComponentFactory(BAUnitPickerComponent),
                );
                baUnit.instance.saved.subscribe(($event) => {
                    this.baUnitSave($event);
                });
            }, 100);
        }
    }
}

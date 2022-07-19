import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
    selector: 'sog-parcel-cards',
    template: `<sog-parcel-card
        class="parcel-cards"
        *ngFor="let parcel of parcels"
        [parcel]="parcel.mode !== 'btn' ? parcel : undefined"
        [addBtn]="parcel.mode === 'btn'"
        (add)="onAdd()"
        (edit)="onEdit($event)"
        (delete)="onDelete($event)"
    >
    </sog-parcel-card>`,
    styles: [''],
})
export class SogParcelCardsComponent implements OnChanges {
    addButton = {
        mode: 'btn',
    };

    testParcel = {
        unit: 'some',
    };
    @Input() parcels: any[];
    @Input() addBtn: boolean;
    @Output() add = new EventEmitter();
    @Input() max = -1;
    @Output() selectedItemChanged = new EventEmitter();
    items = [];
    selectItem = {};

    onAdd() {
        if (this.addBtn) {
            this.items.pop();
        }
        this.items.push(this.testParcel);
        if (this.addBtn) {
            this.items.push(this.addButton);
        }
        this.add.emit();
    }

    onEdit(parcel) {
        this.selectedItemChanged.emit(parcel);
    }

    onDelete(parcel) {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].parcelNumber === parcel.parcelNumber) {
                this.items.splice(i, 1);
            }
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.items = this.parcels && this.parcels.length > 0 ? this.parcels : [];
        if (this.addBtn) {
            this.items.push(this.addButton);
        }
    }
}

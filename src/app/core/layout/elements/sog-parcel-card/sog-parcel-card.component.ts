import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'sog-parcel-card',
    template: `
        <div class="parcel-card" [ngClass]="{ 'parcel-add-card': addBtn }" (click)="onClick()">
            <div *ngIf="parcel; else addTemplate">
                <div class="content">
                    <div class="title-bar">
                        <div class="title">
                            {{ parcel.parcelNumber }}
                        </div>
                        <div class="buttons">
                            <i class="icon icon-edit-eland btn-edit" aria-hidden="true" (click)="onEdit()"></i>
                            <i class="fa fa-trash-o btn-delete" aria-hidden="true" (click)="onDelete()"></i>
                        </div>
                    </div>
                    <div class="line">AREA : {{ parcel.area }}</div>
                    <div class="line">UNIT : {{ parcel.unit }}</div>
                </div>
            </div>
            <ng-template #addTemplate>
                <i class="icon icon-add-eland parcel-add-card-icon" aria-hidden="true"></i>
            </ng-template>
        </div>
    `,
    styleUrls: ['sog-parcel-card.component.scss'],
})
export class SogParcelCardComponent {
    @Input() parcel: any;
    @Input() addBtn: boolean;
    @Output() add = new EventEmitter();
    @Output() delete = new EventEmitter();
    @Output() edit = new EventEmitter();

    onClick() {
        if (this.addBtn) {
            this.add.emit();
        }
    }

    onDelete() {
        this.delete.emit(this.parcel);
    }

    onEdit() {
        this.edit.emit(this.parcel);
    }
}

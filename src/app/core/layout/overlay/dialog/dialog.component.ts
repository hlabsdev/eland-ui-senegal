import { Component, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styles: [],
})
export class DialogComponent implements OnDestroy, OnChanges {
    @Input() display: boolean;
    @Input() header: string;
    @Input() autoHeight = true;
    @Output() displayChange = new EventEmitter();
    style: any = {};
    cStyle: any = {};
    close() {
        this.displayChange.emit(false);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.autoHeight) {
            this.cStyle['min-height'] = '80%';
        }
    }

    ngOnDestroy() {
        this.displayChange.unsubscribe();
    }
}

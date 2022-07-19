import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { DialogConfig } from '@app/core/models/dialogConfig';

@Component({
    selector: 'eland-dialog',
    templateUrl: './eland-dialog.component.html',
    styleUrls: ['./eland-dialog.component.scss']
})
export class ElandDialogComponent {
    @Output() next = new EventEmitter();
    @Output() previous = new EventEmitter();
    @Output() save = new EventEmitter();
    @Output() cancel = new EventEmitter();
    @Output() close = new EventEmitter();
    @Input() config = new DialogConfig();
    disable: boolean;
    @ContentChild("content")
    contentRef?: TemplateRef<any>;

    @ContentChild("tab")
    tabRef?: TemplateRef<any>;

    activeTab: number = 0;

    constructor() { }

    goSave = () => this.config.canSave ? this.save.emit() : false;

    goPrevious = (i: boolean) => {
        i ? false : this.activeTab--;
        this.previous.emit(this.activeTab);
    };

    goNext = (i: boolean) => {
        if (this.config.tabs.length !== (this.activeTab + 1)) {
            i ? false : this.activeTab++;
            this.next.emit(this.activeTab);
        }
    };

    goCancel = () => {
        this.config.display = false;
        this.cancel.emit();
    };
    goClose = () => {
        this.config.display = false;
        this.close.emit();
    };

    changeTab = (index: number) => this.activeTab = index;
}

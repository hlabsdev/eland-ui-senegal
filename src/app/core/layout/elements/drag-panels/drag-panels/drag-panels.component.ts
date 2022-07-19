import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';
import { DragPanelItem } from '@app/core/layout/elements/drag-panels/drag-panels/dragPanelItem.template';
import { DragElement } from '@app/core/layout/elements/drag-panels/drag-panels/drag-element';

@Component({
    selector: 'sog-drag-panels',
    templateUrl: './drag-panels.component.html',
    styleUrls: ['./drag-panels.component.scss'],
})
export class DragPanelsComponent {
    @Input() title: string;
    @ContentChild('header') header: TemplateRef<any>;
    @ContentChild('body') body: TemplateRef<any>;
    @Input() dragPanelItem: DragPanelItem = {};
    @Input() headerTemplate: TemplateRef<any>;
    @Input() bodyTemplate: TemplateRef<any>;
    @Input() headerTitle: string;
    // eslint-disable-next-line @angular-eslint/no-output-native
    @Output() drop: EventEmitter<CdkDragDrop<any[]>> = new EventEmitter<CdkDragDrop<any[]>>();
    @Input() dropText: string;
    @Input() predicateOptions: { maxElements?: number } = {};
    @Input() predicate: Function;
    @Input() disabledSorting = false;
    @Input() readonly = false;

    defaultPredicate(item: CdkDrag<DragElement<any>>) {
        if (this.predicateOptions.maxElements !== -1 && this.predicateOptions.maxElements) {
            return !(this.dragPanelItem.items.length >= this.predicateOptions.maxElements) && !this.readonly;
        } else {
            return true && !this.readonly;
        }
    }
}

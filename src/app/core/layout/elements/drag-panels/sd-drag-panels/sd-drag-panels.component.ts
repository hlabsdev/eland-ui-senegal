import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { DragPanelItem } from '@app/core/layout/elements/drag-panels/drag-panels/dragPanelItem.template';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
    selector: 'sog-sd-drag-panels',
    templateUrl: './sd-drag-panels.components.html',
})
export class SdDragPanelsComponent {
    @ContentChild('sdHeaderTitle') headerTitle: TemplateRef<any>;
    @ContentChild('sdHeaderInfos') headerInfos: TemplateRef<any>;
    @ContentChild('sdBodyTitle') bodyTitle: TemplateRef<any>;
    @ContentChild('sdBodyInfos') bodyInfos: TemplateRef<any>;
    @Input() source: DragPanelItem;
    @Input() destinations: DragPanelItem[];
    @Input() headerTemplateTitle: TemplateRef<any>;
    @Input() headerTemplateInfos: TemplateRef<any>;
    @Input() titles: { source: string; destination: string };
    @Input() bodyTemplateTitle: TemplateRef<any>;
    @Input() bodyTemplateInfos: TemplateRef<any>;
    @Input() readOnly: boolean;
    @Output() sourceDrop: EventEmitter<CdkDragDrop<any[]>> = new EventEmitter<CdkDragDrop<any[]>>();
    @Output() destinationDrop: EventEmitter<CdkDragDrop<any[]>> = new EventEmitter<CdkDragDrop<any[]>>();
    @Output() expand: EventEmitter<any> = new EventEmitter<any>();
    @Output() remove: EventEmitter<any> = new EventEmitter<any>();
}

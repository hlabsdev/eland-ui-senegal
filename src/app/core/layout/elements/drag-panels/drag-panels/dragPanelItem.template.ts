import { DragElement } from '@app/core/layout/elements/drag-panels/drag-panels/drag-element';

export interface DragPanelItem<topType = any, bottomType = any> {
    items?: DragElement<bottomType>[];
    item?: DragElement<topType>;
}

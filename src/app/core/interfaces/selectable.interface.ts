import { SelectItem } from 'primeng/api';

export interface Selectable {
    toSelectItem(): SelectItem;
}

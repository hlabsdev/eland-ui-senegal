export class DragElement<T> {
    base: T;
    dragDisabled: boolean;
    showMoreInfos: boolean;
    isRemovable: boolean;

    constructor(obj: T, disabled?: boolean | boolean) {
        this.base = obj;
        this.dragDisabled = !!disabled;
    }
}

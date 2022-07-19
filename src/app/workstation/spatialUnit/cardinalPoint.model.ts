import { MultiInput } from '@app/core/interfaces/multiInput.interface';

export class CardinalPoint implements MultiInput {
    id: string;
    point: string;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.point = obj.point;
    }

    getMultiInputValue() {
        return this.point;
    }

    setMultiInputValue(value: string) {
        this.point = value;
    }
}

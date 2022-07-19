import { CodeList } from '@app/core/models/codeList.model';
import Utils from '@app/core/utils/utils';

export class AreaValue {
    id: string;
    areaSize: number;
    initialAreaSize: number;
    measureUnit: any;
    type: CodeList;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.areaSize = Utils.parseFloat(obj.areaSize);
        this.initialAreaSize = Utils.parseFloat(obj.initialAreaSize);
        this.measureUnit = obj.measureUnit;
        this.type = obj.type;
    }
}

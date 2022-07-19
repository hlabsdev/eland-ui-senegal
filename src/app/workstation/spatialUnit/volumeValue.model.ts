import { CodeList } from '@app/core/models/codeList.model';
import Utils from '@app/core/utils/utils';

export class VolumeValue {
    id: string;
    volumeSize: number;
    initialVolumeSize: number;
    measureUnit: CodeList;
    type: CodeList;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.volumeSize = Utils.parseFloat(obj.areaSize);
        this.initialVolumeSize = Utils.parseFloat(obj.initialAreaSize);
        this.measureUnit = obj.measureUnit;
        this.type = obj.type;
    }
}

import { RRR } from '../rrr/rrr.model';
import { RightType } from '../rightType/rightType.model';
import { CodeList } from '@app/core/models/codeList.model';

export class Right extends RRR {
    type: CodeList;
    rightType: RightType;
    acquisitionMode: CodeList;

    constructor(obj: any = {}) {
        super(obj);
        this.type = obj.type;
        this.rightType = obj.rightType;
        this.acquisitionMode = obj.acquisitionMode;
    }
}

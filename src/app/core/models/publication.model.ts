import Utils from '../utils/utils';
import { CodeList } from './codeList.model';

export class Publication {
    id: string;
    target: CodeList;
    name: CodeList;
    number: string;
    date: Date;
    baUnitId: string;
    baUnitVersion: number;
    titleNumber: string;
    applicationNumber: string;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.target = obj.target;
        this.name = obj.name;
        this.number = obj.number;
        this.date = Utils.setDate(obj.date);
        this.baUnitId = obj.baUnitId;
        this.baUnitVersion = obj.baUnitVersion;
        this.titleNumber = (obj.titleId && obj.code && `${obj.titleId}/${obj.code}`) || '';
        this.applicationNumber = obj.applicationNumber;
    }
}

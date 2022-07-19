import Utils from '../utils/utils';
import { CodeList } from './codeList.model';

export class TypeID {
    id: string;
    typeDocument: CodeList;
    documentNumber: string;
    issueDate: Date;
    expirationDate: Date;
    issuePlace: string;
    empressAuthority: string;

    constructor(obj: any = {}) {
        Object.assign(this, obj);
        this.typeDocument = obj.typeDocument ? new CodeList(obj.typeDocument) : null;
        this.issueDate = Utils.setDate(obj.issueDate);
        this.expirationDate = Utils.setDate(obj.expirationDate);
    }
}

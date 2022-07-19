import { CodeList } from '@app/core/models/codeList.model';

export class ExtendedCodelist extends CodeList {
    required: boolean;
    checked: boolean;
    constructor(obj: any = {}) {
        super(obj);
        this.required = obj.required;
        this.checked = obj.checked;
    }
}

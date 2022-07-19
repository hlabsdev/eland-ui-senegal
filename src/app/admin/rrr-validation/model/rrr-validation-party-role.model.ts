import { CodeList } from '@app/core/models/codeList.model';

export class RRRValidationPartyRole {
    rrrValidationId: string;
    role: CodeList;
    required: boolean;

    id: string;

    constructor(obj: any = {}) {
        this.rrrValidationId = obj.rrrValidationId;
        this.role = obj.role ? new CodeList(obj.role) : null;
        this.required = obj.required ? obj.required : false;

        this.id = obj.id;
    }
}

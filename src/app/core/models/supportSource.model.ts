import { Source } from './source.model';
import { SourceType } from '../../workstation/source/sourceType.model';
export class SupportSource extends Source {
    comments: string;
    constructor(obj: any = {}) {
        super(obj);
        this.comments = obj.comments;
    }
}

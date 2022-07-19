import { Source } from './source.model';
import { Act } from './act.model';
export class AdministrativeSource extends Source {
    type: any;
    text: string;
    act: Act;

    constructor(obj: any = {}) {
        super(obj);
        this.type = obj.type;
        this.text = obj.text;
        this.act = obj.act ? new Act(obj.act) : new Act();
    }
}

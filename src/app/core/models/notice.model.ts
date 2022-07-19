import Utils from '../utils/utils';
import { Act } from './act.model';

export class Notice {
    id: string;
    requisition: Act;
    rightsChargesDetail: string;
    noticeDate: Date;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.requisition = obj.requisition ? new Act(obj.requisition) : null;
        this.rightsChargesDetail = obj.rightsChargesDetail;
        this.noticeDate = Utils.setDate(obj.noticeDate);
    }
}

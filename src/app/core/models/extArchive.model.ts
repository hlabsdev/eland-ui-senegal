import Utils from '@app/core/utils/utils';

export class ExtArchive {
    id: string;
    sid: string;
    fileName: string;
    folder: string;
    recordation: Date;
    submission: Date;
    acceptance: Date;
    data: string;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.sid = obj.sid;
        this.fileName = obj.fileName;
        this.folder = obj.folder;
        this.recordation = Utils.setDate(obj.recordation);
        this.submission = Utils.setDate(obj.submisison);
        this.acceptance = Utils.setDate(obj.acceptance);
        this.data = obj.data;
    }
}

import { Source } from '@app/core/models/source.model';

export class UploadSource {
    source: Source;
    file: any;
    folderName: string;

    constructor(obj: any = {}) {
        this.source = obj.source;
        this.file = obj.file;
        this.folderName = obj.folderName;
    }
}

import { CodeList } from './codeList.model';

export class Bulletin {
    id: string;
    recipientProsecutor: CodeList;
    localityTypeProsecutor: CodeList;
    localityProsecutor: string;

    recipientMayor: CodeList;
    localityTypeMayor: CodeList;
    localityMayor: string;

    recipientBoss: CodeList;
    localityTypeBoss: CodeList;
    localityBoss: string;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.recipientProsecutor = obj.recipientProsecutor;
        this.localityTypeProsecutor = obj.localityTypeProsecutor;
        this.localityProsecutor = obj.localityProsecutor;
        this.recipientMayor = obj.recipientMayor;
        this.localityTypeMayor = obj.localityTypeMayor;
        this.localityMayor = obj.localityMayor;
        this.recipientBoss = obj.recipientBoss;
        this.localityTypeBoss = obj.localityTypeBoss;
        this.localityBoss = obj.localityBoss;
    }
}

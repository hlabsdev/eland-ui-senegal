import Utils from '../utils/utils';

export class Deployment {
    id: string;
    name: string;
    source: string;
    tenantId: string;
    deploymentTime: Date;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.name = obj.name;
        this.source = obj.source;
        this.tenantId = obj.tenantId;
        this.deploymentTime = Utils.setDate(obj.deploymentTime);
    }
}

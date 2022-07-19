import Utils from '../utils/utils';

export class ProcessInstance {
    id: string;
    definitionId: string;
    businessKey: string;
    caseInstanceId: string;
    ended: boolean;
    suspended: boolean;
    tenantId: string;
    transactionName: string;
    created: Date;
    updated: Date;
    state: string;
    processDefinitionId: string;
    processDefinitionKey: string;
    processDefinitionName: string;
    startTime: Date;
    processDefinitionVersion: number;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.definitionId = obj.definitionId;
        this.businessKey = obj.businessKey;
        this.caseInstanceId = obj.caseInstanceId;
        this.ended = obj.ended;
        this.state = obj.state;
        this.suspended = obj.suspended;
        this.tenantId = obj.tenantId;
        this.transactionName = obj.transactionName;
        this.created = Utils.setDate(obj.created);
        this.updated = Utils.setDate(obj.updated);
        this.startTime = Utils.setDate(obj.startTime);
        this.processDefinitionVersion = obj.processDefinitionVersion ? obj.processDefinitionVersion : null;
        this.processDefinitionId = obj.processDefinitionId;
        this.processDefinitionKey = obj.processDefinitionKey ? obj.processDefinitionKey : null;
        this.processDefinitionName = obj.processDefinitionName;
    }
}

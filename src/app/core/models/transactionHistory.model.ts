export class TransactionHistory {
    id: string;
    businessKey: string;
    processDefinitionId: string;
    processDefinitionKey: string;
    processDefinitionName: string;
    processDefinitionVersion: string;
    startTime: Date;
    endTime: Date;
    durationInMillis: number;
    startUserId: string;
    startActivityId: string;
    deleteReason: string;
    superProcessInstanceId: string;
    superCaseInstanceId: string;
    caseInstanceId: string;
    tenantId: string;
    state: string;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.businessKey = obj.businessKey;
        this.processDefinitionId = obj.processDefinitionId;
        this.processDefinitionKey = obj.processDefinitionKey;
        this.processDefinitionName = obj.processDefinitionName;
        this.processDefinitionVersion = obj.processDefinitionVersion;
        this.startTime = obj.startTime;
        this.endTime = obj.endTime;
        this.durationInMillis = obj.durationInMillis;
        this.startUserId = obj.startUserId;
        this.startActivityId = obj.startActivityId;
        this.deleteReason = obj.deleteReason;
        this.superProcessInstanceId = obj.superProcessInstanceId;
        this.superCaseInstanceId = obj.superCaseInstanceId;
        this.caseInstanceId = obj.caseInstanceId;
        this.tenantId = obj.tenantId;
        this.state = obj.state;
    }
}

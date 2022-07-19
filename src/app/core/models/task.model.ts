import Utils from '@app/core/utils/utils';

export class Task {
    id: string;
    name: string;
    assignee: string;
    created: Date;
    due: Date;
    followUp: string;
    delegationState: string;
    description: string;
    executionId: string;
    owner: string;
    parentTaskId: string;
    priority: number;
    processDefinitionId: string;
    processInstanceId: string;
    caseExecutionId: string;
    caseDefinitionId: string;
    caseInstanceId: string;
    taskDefinitionKey: string;
    formKey: string;
    formKeys: string[];
    tenantId: string;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.name = obj.name;
        this.assignee = obj.assignee;
        this.created = Utils.setDate(obj.created);
        this.due = Utils.setDate(obj.due);
        this.followUp = obj.followUp;
        this.delegationState = obj.delegationState;
        this.description = obj.description;
        this.executionId = obj.executionId;
        this.owner = obj.owner;
        this.parentTaskId = obj.parentTaskId;
        this.priority = obj.priority;
        this.processDefinitionId = obj.processDefinitionId;
        this.processInstanceId = obj.processInstanceId;
        this.taskDefinitionKey = obj.taskDefinitionKey;
        this.caseExecutionId = obj.caseExecutionId;
        this.caseInstanceId = obj.caseInstanceId;
        this.caseDefinitionId = obj.caseDefinitionId;
        this.formKey = obj.formKey;
        this.formKeys = Utils.splitCommaOrSemiColon(obj.formKey);
        this.tenantId = obj.tenantId;
    }

    formSelectItem() {
        return Utils.formsKeysToSelectItem(this.formKeys);
    }

    firstFormKey() {
        return this.formKeys[0];
    }
}

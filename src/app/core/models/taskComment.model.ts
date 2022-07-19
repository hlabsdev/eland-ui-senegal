import Utils from '../utils/utils';

export class TaskComment {
    id: string;
    userId: string;
    username: string;
    taskId: string;
    taskName: string;
    dateTime: Date;
    subject: string;
    message: string;
    removalTime: Date;
    rootProcessInstanceId: string;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.userId = obj.userId;
        this.username = obj.username;
        this.taskId = obj.taskId;
        this.taskName = obj.taskName;
        this.dateTime = Utils.setDate(obj.dateTime);
        this.subject = obj.subject;
        this.message = obj.message;
        this.removalTime = obj.removalTime;
        this.rootProcessInstanceId = obj.rootProcessInstanceId;
    }
}

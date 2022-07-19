import { DialogOptionsType } from '@app/registration/task/dialogs/multi-dialogs/dialog-options-type.model';
import { Step } from '@app/registration/task/dialogs/multi-dialogs/step.model';
import { Variables } from '@app/core/models/variables.model';

export class DialogOptions {
    identifier: string;
    options: string[];
    default: string;
    isDone: boolean;
    type: DialogOptionsType;
    value: any;
    name: string;
    filters: any;
    variables: Variables;

    constructor(obj: Partial<DialogOptions>) {
        this.identifier = obj.identifier;
        this.options = obj.options;
        this.default = obj.default;
        this.isDone = obj.isDone;
        this.type = new DialogOptionsType(obj.type);
        this.name = obj.name;
        this.value = obj.value;
        this.filters = obj.filters;
        this.variables = obj.variables;
    }

    toStep = (prefix: string): Step => ({
        label: prefix + this.identifier + '.TITLE',
        isDone: this.isDone,
        value: this,
    });

    getResultVariable(): Variables {
        return this.type.name === 'complete'
            ? { valid: { value: true, type: 'Boolean', valueInfo: {} } }
            : this.type.name === 'user-choice'
            ? { ['MULTICHOICERESULTS' + this.name]: { value: this.value.username, type: 'String', valueInfo: {} } }
            : { ['MULTICHOICERESULT' + this.name]: { value: this.value, type: 'String', valueInfo: {} } };
    }
}

export class DialogOptionsType {
    static ['user-choice'] = DialogOptionsType.fromString('user-choice');
    static ['add-comment'] = DialogOptionsType.fromString('add-comment');
    static complete = DialogOptionsType.fromString('complete');
    static ['choice-options'] = DialogOptionsType.fromString('choice-options');
    static ['date-options'] = DialogOptionsType.fromString('choice-options');

    name: string;

    constructor(obj: Partial<DialogOptionsType>) {
        this.name = obj.name;
    }

    static fromString(type: string) {
        return new DialogOptionsType({ name: type });
    }
}

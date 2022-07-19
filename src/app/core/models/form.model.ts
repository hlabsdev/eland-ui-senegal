import { FormType } from './form-type.model';

export class Form {
    id?: string;
    name?: string;
    description?: string;
    body?: string;
    type?: FormType;
    forms?: Form[];
    childForms?: any;
    childFormsArr?: any[];
    formNames?: string;
    bodyWrap?: string;

    constructor(obj) {
        this.id = obj.id;
        this.name = obj.name;
        this.description = obj.description;
        this.body = obj.body;
        this.type = obj.type || FormType.LIST_FORM;
        this.childForms = obj.childForms;
        this.childFormsArr = obj.childForms ? JSON.parse(obj.childForms) : [];
        this.forms = obj.forms || [];
        this.formNames = '';
    }

    prepareChildForms() {
        this.childForms = JSON.stringify(this.childFormsArr || []);
        return this;
    }
}

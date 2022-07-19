import { ComponentFactoryResolver, Directive, Input, OnInit, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ListFormComponent } from '@app/workstation/list-form/list-form.component';
import { FormComponent } from '@app/workstation/baseForm/form.component';
import { Form } from '@app/core/models/form.model';

const componentMapper = {
    LIST_FORM: ListFormComponent,
    FORM: FormComponent,
};
@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[dynForm]',
})
export class DynamicFormsDirective implements OnInit {
    @Input() form: Form;
    @Input() group: FormGroup;
    @Input() readOnly: boolean;

    componentRef: any;
    constructor(private resolver: ComponentFactoryResolver, private container: ViewContainerRef) {}
    ngOnInit() {
        const factory = this.resolver.resolveComponentFactory(componentMapper[this.form.type.toString()]);
        this.componentRef = this.container.createComponent(factory);
        this.componentRef.instance.form = this.form;
        this.componentRef.instance.group = this.group;
    }
}

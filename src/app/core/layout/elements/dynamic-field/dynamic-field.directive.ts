import { MultiInputComponent } from './../multi-input/multi.input.component';
import { ComponentFactoryResolver, Directive, Input, OnInit, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldConfig } from '@app/core/models/field.model';
import { ButtonComponent } from '../button/button.component';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { DateComponent } from '../date/date.component';
import { FractionComponent } from '../fraction/fraction.component';
import { HtmlEditorComponent } from '../html-editor/html-editor.component';
import { InputComponent } from '../input/input.component';
import { LabelComponent } from '../label/label.component';
import { SelectComponent } from '../select/select.component';
import { SeparatorComponent } from '../separator/separator.component';
import { TextareaComponent } from '../textarea/textarea.component';

const componentMapper = {
    input: InputComponent,
    label: LabelComponent,
    button: ButtonComponent,
    select: SelectComponent,
    separator: SeparatorComponent,
    date: DateComponent,
    checkbox: CheckboxComponent,
    fraction: FractionComponent,
    multiInput: MultiInputComponent,
    htmlEditor: HtmlEditorComponent,
    textarea: TextareaComponent,
};
@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[dynamicField]',
})
export class DynamicFieldDirective implements OnInit {
    @Input() field: FieldConfig;
    @Input() group: FormGroup;
    @Input() readOnly: boolean;

    componentRef: any;
    constructor(private resolver: ComponentFactoryResolver, private container: ViewContainerRef) {}
    ngOnInit() {
        const factory = this.resolver.resolveComponentFactory(componentMapper[this.field.type]);
        this.componentRef = this.container.createComponent(factory);
        this.componentRef.instance.field = this.field;
        this.componentRef.instance.group = this.group;
        this.componentRef.instance.readOnly = this.readOnly;
    }
}

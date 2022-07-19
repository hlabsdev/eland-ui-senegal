import { AddCommentComponent } from '@app/registration/task/dialogs/add-comment/add-comment.component';
import { CompleteComponent } from '@app/registration/task/dialogs/complete/complete.component';
import { UserChoiceComponent } from '@app/registration/task/dialogs/user-choice/user-choice.component';
import { ChoiceOptionsComponent } from '@app/registration/task/dialogs/choice-options/choice-options.component';
import { ComponentFactoryResolver, Directive, Input, OnInit, ViewContainerRef } from '@angular/core';
import { DialogOptions } from '@app/registration/task/dialogs/multi-dialogs/dialog-options.model';
import { DateOptionsComponent } from '@app/registration/task/dialogs/date-options/date-options.component';

const dialogsMapper = {
    'user-choice': UserChoiceComponent,
    'add-comment': AddCommentComponent,
    complete: CompleteComponent,
    'choice-options': ChoiceOptionsComponent,
    'date-options': DateOptionsComponent,
};

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[dynMultiDialogs]',
})
export class DynamicDialogDirective implements OnInit {
    componentRef: any;
    @Input() dialogOptions: DialogOptions;

    constructor(private resolver: ComponentFactoryResolver, private container: ViewContainerRef) {}

    ngOnInit() {
        if (
            this.dialogOptions &&
            this.dialogOptions.type &&
            Object.keys(dialogsMapper).indexOf(this.dialogOptions.type.name) >= 0
        ) {
            const factory = this.resolver.resolveComponentFactory(
                dialogsMapper[this.dialogOptions.type.name.toString()],
            );
            this.componentRef = this.container.createComponent(factory);
            this.componentRef.instance.dialogOptions = this.dialogOptions;
        }
    }
}

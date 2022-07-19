import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    AfterViewInit,
    ChangeDetectorRef,
    OnChanges,
    SimpleChanges,
    SimpleChange,
} from '@angular/core';
import { ResponsibleParty } from '@app/core/models/responsibleParty.model';
import { DynamicFormComponent } from '@app/core/layout/elements/dynamic-form/dynamic-form.component';
import { FieldConfig } from '@app/core/models/field.model';

@Component({
    selector: 'app-responsible-party-form',
    template: `<dynamic-form
        [fields]="config"
        [readOnly]="readOnly"
        [errorMessage]="errorMessage"
        [title]="title"
        (submit)="submit($event)"
        [fieldValues]="fieldValues"
        [saveToLadm]="true"
        (cancelButtonClicked)="cancel()"
    ></dynamic-form>`,
})
export class ResponsiblePartyFormComponent implements AfterViewInit, OnChanges {
    @ViewChild(DynamicFormComponent) form: DynamicFormComponent;
    @Input() responsibleParty: ResponsibleParty;
    @Input() config: FieldConfig[];
    @Input() showAllLabel: boolean;
    @Input() errorMessage: string;
    @Input() readOnly = false;

    @Output() saveButtonClicked = new EventEmitter<ResponsibleParty>();
    @Output() cancelButtonClicked = new EventEmitter<boolean>();

    title: string;
    fieldValues: any;

    constructor(private changeDetector: ChangeDetectorRef) {}

    ngOnChanges(changes: SimpleChanges) {
        const error: SimpleChange = changes.errorMessage;
        if (error && error.currentValue) {
            this.errorMessage = error.currentValue;
        }
    }

    ngAfterViewInit() {
        this.title = this.responsibleParty.id ? 'RESPONSIBLE_PARTY.TITLE_EDIT' : 'RESPONSIBLE_PARTY.TITLE_ADD';
        this.fieldValues = this.responsibleParty;
        this.changeDetector.detectChanges();
    }

    submit(responsibleParty: ResponsibleParty) {
        this.config.filter((item) => item.disabled).forEach((item) => this.responsibleParty[item.name] == null);
        Object.keys(responsibleParty).forEach((key) => (this.responsibleParty[key] = responsibleParty[key]));
        this.saveButtonClicked.emit(this.responsibleParty);
    }

    cancel() {
        this.form.form.reset();
        this.fieldValues = this.responsibleParty;
        this.cancelButtonClicked.emit(true);
        this.errorMessage = null;
    }
}

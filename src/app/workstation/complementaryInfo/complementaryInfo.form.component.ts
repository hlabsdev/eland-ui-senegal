import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChange,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { DynamicFormComponent } from '@app/core/layout/elements/dynamic-form/dynamic-form.component';
import { ComplementaryInfo } from '@app/core/models/complementaryInfo.model';
import { FieldConfig } from '@app/core/models/field.model';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { BAUnit } from '@app/workstation/baUnit/baUnit.model';

@Component({
    selector: 'app-complementary-info-form',
    template: `<dynamic-form
        [title]="title"
        [fields]="config"
        [errorMessage]="errorMessage"
        [readOnly]="formVariables.isReadOnly"
        [hideSaveButton]="formVariables.isReadOnly"
        (submit)="submit($event)"
        [fieldValues]="fieldValues"
        (cancelButtonClicked)="cancel()"
        [saveToLadm]="true"
    >
    </dynamic-form>`,
})
export class ComplementaryInfoFormComponent implements AfterViewInit, OnInit, OnChanges, OnDestroy {
    @ViewChild(DynamicFormComponent) form: DynamicFormComponent;
    @Input() complementaryInfo: ComplementaryInfo;
    @Input() config: FieldConfig[];
    @Input() showAllLabel: boolean;
    @Input() errorMessage: string;
    @Input() readOnly = false;
    @Input() formVariables: FormVariables = new FormVariables({});
    @Output() saveButtonClicked = new EventEmitter<ComplementaryInfo>();
    @Output() cancelButtonClicked = new EventEmitter<boolean>();

    baUnit: BAUnit;
    title: string;
    fieldValues: any;

    valueChanges: Subscription;

    constructor(protected translateService: TranslateService, private changeDetector: ChangeDetectorRef) {}

    ngOnInit() {
        this.translateService
            .get(`COMPLEMENTARY_INFO.${this.formVariables.complementaryInfoSection}`)
            .subscribe((val) => (this.title = val));
    }

    ngOnChanges(changes: SimpleChanges) {
        const error: SimpleChange = changes.errorMessage;
        if (error && error.currentValue) {
            this.errorMessage = error.currentValue;
        }
    }

    ngAfterViewInit() {
        this.fieldValues = this.complementaryInfo;
        this.fieldValues.inscriptionDate = this.formVariables.rdai.depositDate;
        this.setConfigs(this.formVariables.complementaryInfoSection);
        this.changeDetector.detectChanges();
    }

    ngOnDestroy(): void {
        if (this.valueChanges) {
            this.valueChanges.unsubscribe();
        }
    }

    setConfigs(section) {
        this.config = this.config.map((item) => {
            item.isEnabled([section]);
            return item;
        });
    }

    submit(complementaryInfo: ComplementaryInfo) {
        Object.keys(complementaryInfo).forEach((key) => (this.complementaryInfo[key] = complementaryInfo[key]));
        this.saveButtonClicked.emit(this.complementaryInfo);
    }

    cancel() {
        this.form.form.reset();
        this.fieldValues = this.complementaryInfo;
        this.setConfigs(this.formVariables.complementaryInfoSection);
        this.cancelButtonClicked.emit(true);
        this.errorMessage = null;
    }
}

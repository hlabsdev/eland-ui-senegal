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
    OnDestroy,
    OnInit,
} from '@angular/core';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { BAUnit } from '@app/workstation/baUnit/baUnit.model';
import { Subscription } from 'rxjs';
import { DynamicFormComponent } from '@app/core/layout/elements/dynamic-form/dynamic-form.component';
import { ComplementaryInfo } from '@app/core/models/complementaryInfo.model';
import { FieldConfig } from '@app/core/models/field.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-bulletin-form',
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
export class BulletinFormComponent implements AfterViewInit, OnInit, OnChanges, OnDestroy {
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
        this.title = 'BULLETIN.TITLE';
    }

    ngOnChanges(changes: SimpleChanges) {
        const error: SimpleChange = changes.errorMessage;
        if (error && error.currentValue) {
            this.errorMessage = error.currentValue;
        }
    }

    ngAfterViewInit() {
        this.fieldValues = this.complementaryInfo;
        this.setConfigs();
        this.changeDetector.detectChanges();
    }

    ngOnDestroy(): void {
        if (this.valueChanges) {
            this.valueChanges.unsubscribe();
        }
    }

    setConfigs() {
        this.config = this.config.map((item) => {
            item.isEnabled(['BULLETIN']);
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
        this.setConfigs();
        this.cancelButtonClicked.emit(true);
        this.errorMessage = null;
    }
}

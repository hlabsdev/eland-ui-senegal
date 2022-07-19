import { Component, AfterViewInit, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FieldConfig } from '@app/core/models/field.model';
import { ValidationService } from '@app/core/utils/validation.service';
import { first } from 'rxjs/operators';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-fraction',
    templateUrl: './fraction.component.html',
})
export class FractionComponent implements AfterViewInit, OnInit, OnDestroy {
    fractionForm = new FormGroup({
        numerator: new FormControl(''),
        denominator: new FormControl(''),
    });

    field: FieldConfig;
    group: FormGroup;
    readOnly: boolean;
    numerator: string;
    denominator: string;
    validatorPattern: string;
    alertService: any;
    intRegEx: RegExp;
    valueChanges: Subscription;
    fieldValueChanges: Subscription;
    formValueChanges: Subscription;
    constructor(public validationService: ValidationService, private changeDetector: ChangeDetectorRef) {}

    ngOnInit() {
        this.intRegEx = this.validationService.intRegEx;
        this.valueChanges = this.fractionForm.valueChanges.subscribe((changes: any) => {
            this.group.get(this.field.name).setValidators(null);
        });
    }

    ngAfterViewInit() {
        if (this.readOnly) {
            this.fractionForm.disable();
        }

        this.fieldValueChanges = this.group
            .get(this.field.name)
            .valueChanges.pipe(first())
            .subscribe((fieldValue) => {
                this.fractionForm.patchValue(fieldValue);
            });
        this.formValueChanges = this.fractionForm.valueChanges.subscribe((changes) => {
            this.group.get(this.field.name).patchValue(changes);
        });

        this.changeDetector.detectChanges();
    }

    ngOnDestroy(): void {
        this.valueChanges.unsubscribe();
        this.fieldValueChanges.unsubscribe();
        this.formValueChanges.unsubscribe();
    }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormService } from '@app/core/services/form.service';
import { TranslateService } from '@ngx-translate/core';
import { Variables } from '@app/core/models/variables.model';
import { forkJoin, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { FormTemplateBaseComponent } from '@app/workstation/baseForm/form-template-base.component';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { PreregistrationFormality } from './preregistrationFormality.model';
import { PreregistrationFormalityService } from './preregistrationFormality.service';

@Component({
    selector: 'app-workstation',
    templateUrl: 'preregistrationFormality.component.html',
})
export class PreregistrationFormalityComponent extends FormTemplateBaseComponent implements OnInit {
    @Input() formVariables: FormVariables;
    @Input() preregistrationFormality: PreregistrationFormality;
    @Input() form: any;
    @Input() readOnly: boolean;
    @Output() saved = new EventEmitter<{ variable: Variables }>();
    @Output() canceled = new EventEmitter<boolean>();

    constructor(
        private translateService: TranslateService,
        private formService: FormService,
        protected preregistrationFormalityService: PreregistrationFormalityService,
    ) {
        super();
    }

    ngOnInit(): void {
        const preregistrationId: string = this.formVariables && this.formVariables.getPath('preregistrationId');
        const preregistrationObs$ = preregistrationId
            ? this.preregistrationFormalityService.getPreregistrationFormality({ id: preregistrationId })
            : this.preregistrationFormality
            ? of(this.preregistrationFormality)
            : of(new PreregistrationFormality());

        const formObs$ = this.form ? of(this.form) : this.formService.getFormByName('RFP_FORM');

        forkJoin([preregistrationObs$, formObs$])
            .pipe(
                mergeMap(([prf, form]) => {
                    if (form && form.body) {
                        this.form = JSON.parse(form.body);
                    }
                    return this.formVariables
                        ? this.preregistrationFormalityService.assignPrePopulatedData(this.formVariables, prf)
                        : of(prf);
                }),
            )
            .subscribe((prf) => (this.preregistrationFormality = prf));
    }

    save(data: PreregistrationFormality) {
        const obs$ = this.preregistrationFormality.id
            ? this.preregistrationFormalityService.savePregistrationFormality(this.preregistrationFormality)
            : this.preregistrationFormalityService.createPregistrationFormality(this.preregistrationFormality);

        obs$.subscribe((prf) => {
            this.preregistrationFormality = prf;
            this.saved.emit({
                variable: {
                    preregistrationId: { value: this.preregistrationFormality.id, type: 'String' },
                },
            });
        });
    }

    cancel() {
        this.canceled.emit(true);
    }
}

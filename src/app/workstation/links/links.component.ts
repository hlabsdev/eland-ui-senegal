import { Component, Input } from '@angular/core';
import { SigtasUtilService } from '../../core/utils/sigtasUtil.service';
import { FormTemplateBaseComponent } from '../baseForm/form-template-base.component';
import { FormVariables } from '../baseForm/formVariables.model';

@Component({
    selector: 'app-links',
    template: `
        <div *ngIf="formVariables.sigtasLinks && showLinks" class="row no-gutters p-3 mb-2">
            <p-button
                *ngFor="let link of formVariables.sigtasLinks"
                type="button"
                label=" {{ link.label | translate }}"
                icon="icon icon-link-eland"
                class="info-button me-3 mb-3"
                (click)="windowOpen(link.path)"
            >
            </p-button>
        </div>
    `,
})
export class LinksComponent extends FormTemplateBaseComponent {
    @Input() formVariables: FormVariables;
    @Input() showLinks;
    @Input() service = 'sigtas';

    constructor(protected sigtasUtilService: SigtasUtilService) {
        super();
    }

    windowOpen(path: string) {
        this.sigtasUtilService.openSigtasWindow(path);
    }
}

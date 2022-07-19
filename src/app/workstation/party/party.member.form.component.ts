import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    AfterViewInit,
    ChangeDetectorRef,
    OnDestroy,
} from '@angular/core';
import { DynamicFormComponent } from '@app/core/layout/elements/dynamic-form/dynamic-form.component';
import { PartyMember } from '@app/core/models/partyMember.model';
import { FieldConfig } from '@app/core/models/field.model';
import { PartyTypes } from './partyType.model';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
@Component({
    selector: 'app-party-member-form',
    template: ` <dynamic-form
        [fields]="config"
        [title]="title"
        (submit)="submit($event)"
        [fieldValues]="fieldValues"
        (cancelButtonClicked)="cancel()"
        [saveToLadm]="true"
    >
    </dynamic-form>`,
})
export class PartyMemberFormComponent implements AfterViewInit, OnDestroy {
    @ViewChild(DynamicFormComponent) form: DynamicFormComponent;
    @Input() partyMember: PartyMember;
    @Input() config: FieldConfig[];
    @Output() saveButtonClicked = new EventEmitter<PartyMember>();
    @Output() cancelButtonClicked = new EventEmitter<boolean>();

    errorMessage: string;
    title: string;
    fieldValues: any;
    partyTypeValueChanges: Subscription;

    constructor(private changeDetector: ChangeDetectorRef) {}

    ngAfterViewInit() {
        this.title = this.partyMember.id ? 'PARTY.TITLE_EDIT' : 'PARTY.TITLE_ADD';
        this.fieldValues = _.extend(this.partyMember.party, { share: this.partyMember.share });
        this.setConfigs(this.partyMember.party.partyType);
        this.partyTypeValueChanges = this.form.form.get('partyType').valueChanges.subscribe((fieldChange: any) => {
            if (fieldChange && fieldChange.value) {
                this.setConfigs(fieldChange);
            }
        });
        this.changeDetector.detectChanges();
    }

    ngOnDestroy(): void {
        this.partyTypeValueChanges.unsubscribe();
    }

    setConfigs(partyType) {
        let enabledGroups = ['PARTY'];
        if (partyType) {
            if (partyType.value === PartyTypes.PARTY_NATURAL_PERSON) {
                enabledGroups = ['PARTY', 'NATURAL_PERSON'];
            } else if (partyType.value === PartyTypes.PARTY_LEGAL_PERSON) {
                enabledGroups = ['PARTY', 'LEGAL_PERSON'];
            } else if (partyType.value === PartyTypes.PARTY_GROUP) {
            }
        }
        this.config = this.config.map((item) => {
            item.isEnabled(enabledGroups);
            return item;
        });
    }

    submit(partyMember: any) {
        this.config.filter((item) => item.disabled).forEach((item) => this.partyMember.party[item.name] == null);
        Object.keys(partyMember).forEach((key) => (this.partyMember.party[key] = partyMember[key]));
        this.partyMember.share = partyMember.share;
        this.saveButtonClicked.emit(this.partyMember);
    }

    cancel() {
        this.cancelButtonClicked.emit(true);
        this.errorMessage = null;
    }
}

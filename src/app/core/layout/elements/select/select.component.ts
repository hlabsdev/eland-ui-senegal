import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '@app/core/models/field.model';
import * as _ from 'lodash';
import { SelectService } from './select.service';
import { CodeListService } from '@app/core/services/codeList.service';
import { Subscription } from 'rxjs';
import { SelectItem } from 'primeng/api';
@Component({
    selector: 'app-select',
    templateUrl: './select.component.html',
    styles: [],
})
export class SelectComponent implements OnInit, OnDestroy {
    field: FieldConfig;
    group: FormGroup;
    baseFieldValue: any;
    private valueSubscription: Subscription;

    typeCodeList: SelectItem[];
    constructor(private codelistService: CodeListService, private selectService: SelectService) {}

    ngOnInit() {
        if (this.field.baseSearchStringName) {
            this.group.valueChanges.subscribe((tp) => {
                if (
                    tp[this.field.baseSearchStringName] &&
                    tp[this.field.baseSearchStringName].value !== this.baseFieldValue
                ) {
                    this.baseFieldValue = tp[this.field.baseSearchStringName].value;
                    this.loadLists(
                        this.field.objectMapper
                            ? this.field.objectMapper[tp[this.field.baseSearchStringName].value || '*']
                            : tp[this.field.baseSearchStringName],
                    );
                }
            });
        }
        this.loadLists(
            this.field.optionsSearchString ||
                (this.field.objectMapper && this.field.objectMapper['*'] ? this.field.objectMapper['*'] : ''),
        );
    }

    ngOnDestroy(): void {
        if (this.valueSubscription) {
            this.valueSubscription.unsubscribe();
        }
    }

    onChange($event, field) {
        this.selectService.select({ value: $event.value, name: field.name });
    }

    loadLists(filter: string) {
        if (filter === 'BULLETIN_LOCALITY_TYPE' && this.field.name === 'bulletin.localityTypeBoss') {
            this.valueSubscription = this.codelistService.loadCodeListOptions(filter).subscribe((values) => {
                const detroyElement = ['BULLETIN_CERCLE', 'BULLETIN_COMMUNE'];
                for (let i = 0; i < detroyElement.length; i++) {
                    const index = _.findIndex(values, (option) => option.value === detroyElement[i]);
                    values.splice(index, 1);
                }
                this.field.options = values;
            });
        } else if (filter) {
            this.valueSubscription = this.codelistService.loadCodeListOptions(filter).subscribe((values) => {
                this.field.options = values;
            });
        }
    }
}

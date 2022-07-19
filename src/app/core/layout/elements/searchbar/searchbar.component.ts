import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Table } from 'primeng/table';

@Component({
    selector: 'app-searchbar',
    templateUrl: './searchbar.component.html',
    styleUrls: ['searchbar.component.scss']
})
export class SearchbarComponent implements OnInit {
    @Input() tableCols: any;
    @Input() table: Table | any;
    @Input() visible = true;
    @Input() enableDropdown = true;

    // style input
    @Input() dropdownWidth = 3;
    @Input() searchFieldWidth = 9;

    dropdownOptions: any;
    selectedDropdown: string = null;
    searchText: string = null;

    constructor(private translateService: TranslateService) {}

    ngOnInit() {
        // sets the options for the dropdown
        if (!this.tableCols) {
            return undefined;
        }

        this.dropdownOptions = this.tableCols
            .filter((val) => {
                const field = val.field.toLowerCase();
                return !field.includes('date');
            })
            .filter((val) => {
                const field = val.field.toLowerCase();
                return !field.includes('id');
            })
            .filter((val) => {
                const field = val.field.toLowerCase();
                return !field.includes('created');
            })
            .filter((val) => {
                const field = val.field.toLowerCase();
                return !field.includes('time');
            })
            .map((val) => ({
                label: val.header,
                value: val.field,
            }));

        // adds a default option for the dropdown
        this.dropdownOptions.unshift({
            label: this.translateService.instant('TRANSACTION_INSTANCE.GLOBAL_SEARCH'),
            value: null,
        });
    }

    searchFilter(value: string) {
        if (this.selectedDropdown) {
            this.table.filter(value, this.selectedDropdown, 'contains');
        } else {
            // filters the table when the header is clicked
            this.table.filterGlobal(value, 'contains');
        }
    }
}

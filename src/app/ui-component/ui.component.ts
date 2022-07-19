import { Component, OnInit } from '@angular/core';
import { TableConfig } from '@app/core/models/tableConfig';
import { TableCols } from '@app/core/models/tableCols';
import { DialogConfig } from '@app/core/models/dialogConfig';

@Component({
    templateUrl: './ui.component.html',
    styleUrls: ['./ui.component.scss'],
})
export class UiComponent implements OnInit {
    
    tableConfig: TableConfig = {
        title: 'Table example',
        titleTooltip: 'My tooltips',
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'movies',
        displayAction: true,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: true,
        enableReload: true,
        searchBarField: ['title', 'writer', 'country'],
        actions: [{
            type: 'start',
            callback: 'startFn',
        },{
            type: 'edit',
            callback: 'editFn',
        },{
            type: 'delete',
            callback: 'deleteFn',
        }]
    }

    items: any[] = [];
    cols: TableCols[] = [];


    dialogConfig: DialogConfig;

    constructor() {}

    ngOnInit(): void {
        this.getItems();

        this.cols = [
            { field: 'title', header: 'Title', sortable: true, filterable: true, type: 'text' },
            { field: 'writer', header: 'Writer', sortable: true, filterable: true, type: 'text' },
            { field: 'country', header: 'Country', sortable: true, filterable: true, type: 'text'},
            { field: 'type', header: 'Type', sortable: true, filterable: true, type: 'text' },
            { field: 'language', header: 'Language', sortable: true, filterable: true, type: 'text' },
            { field: 'year', header: 'Year', sortable: true, filterable: true, type: 'text' }
        ];
    }

    getItems(){
        this.items = [
            {
                title: 'Avengers',
                writer: 'English',
                country: 'France, Canada, United States',
                type: 'Series',
                language: 'English',
                year: '2021'
            },
            {
                title: 'Hulk',
                writer: 'English',
                country: 'United States',
                type: 'Films',
                language: 'English',
                year: '2020'
            }
        ]
    }


    onRowSelect = (event: any) => console.log(event.data);
    onRowUnselect = (event: any) => console.log(event.data);
    selectedRow = (event: any) => console.log(event);

    reload = () => this.getItems;

    call($event){
        var fn = $event[0];
        this[fn]($event[1]);
    }

    startFn = (item: any) => console.log(item);
    editFn = (item: any) => console.log(item);
    deleteFn = (item: any) => console.log(item);

    //Dialog
    openDialog = () => {
        this.dialogConfig = {
            showAction: true,
            display: true,
            title: 'Modal example',
            canSave: false,
            tabs: [
                { name: 'Item 1', required: true },
                { name: 'Item 2', required: true, warning: true, disabled: false },
                { name: 'Item 3', required: false, warning: true, disabled: false },
                { name: 'Item 4', required: false, disabled: true },
            ]
        };
    };

    next(activeTab: number){
        console.log(activeTab);
        this.dialogConfig.tabs[activeTab].warning = false; // unlock tab
        this.dialogConfig.canSave = true; //enable save
    }

    previous = (activeTab: number) => console.log(activeTab);

    save = () => {
        console.log('save');
        this.dialogConfig.display = false;
    };

    cancel = () => console.log('cancel');
    

}

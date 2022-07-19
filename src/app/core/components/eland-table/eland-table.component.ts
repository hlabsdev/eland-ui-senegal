import { Component, ContentChild, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { RowSizes } from '@app/core/models/rowSize.model';
import { TableAction } from '@app/core/models/tableAction';
import { TableConfig } from '@app/core/models/tableConfig';
import { TableService } from '@app/core/utils/table.service';

@Component({
    selector: 'eland-table',
    templateUrl: './eland-table.component.html',
    styleUrls: ['./eland-table.component.scss']
})
export class ElandTableComponent implements OnInit {

    @Output() reloadTable = new EventEmitter();
    @Output() selectRow = new EventEmitter();
    @Output() unselectRow = new EventEmitter();
    @Output() selectedRow = new EventEmitter();
    @Output() actions = new EventEmitter();
    @Output() addCallBack = new EventEmitter();
    
    @Input() tableConfig = new TableConfig();

    //Template ref
    @ContentChild("headerTemplate", { static: false })
    headerTemplateRef?: TemplateRef<any>;

    @ContentChild("actions")
    actionsRef?: TemplateRef<any>;

    @ContentChild("body")
    bodyRef?: TemplateRef<any>;

    @ContentChild("rowexpansion")
    rowexpansionRef?: TemplateRef<any>;

    @Input() datas: any[];
    @Input() cols: any[];

    rowSizes: any = RowSizes;
    selected: any[] = [];

    exportColumns: any[];

    expandedRows = {};
    isExpanded: boolean = false;

    constructor(private table: TableService) {}

    ngOnInit(): void {
        this.exportColumns = this.cols.map(col => ({title: col.header, dataKey: col.field}));
    }

    onSelect(event) {
        this.selectRow.emit(event);
    }

    getSelectedRow() {
        this.selectedRow.emit(this.selected);
    }

    onUnselect(event) {
        this.unselectRow.emit(event);
    }

    reload(){
        this.reloadTable.emit();
    }

    pdf(){
        this.table.toPdf(this.exportColumns, this.datas);
    }

    excel(){
        this.table.toExcel(this.datas);
    }

    actionCallback(action: TableAction, item){
        this.actions.emit([action.callback, item]);
    }

    add(){
        this.addCallBack.emit(true);
    }

    onRowExpand() {
        if(Object.keys(this.expandedRows).length === this.datas.length){
          this.isExpanded = true;
        }
    }
    onRowCollapse() {
        if(Object.keys(this.expandedRows).length === 0){
            this.isExpanded = false;
        }
    }

    closeAll() {
        this.expandedRows={};
        this.isExpanded = false;
    }

}

import { TranslateService } from "@ngx-translate/core";
import { RowSizes } from "./rowSize.model";
import { TableAction } from "./tableAction";

export class TableConfig {
    title?: string;
    titleTooltip?: string;
    loading?: boolean;
    selectByCheckBox?: boolean;
    selectByRadio?: boolean;
    rowSelect?: boolean;
    key?: string;
    dataKey?: string;
    displayAction?: boolean;
    paginationRow?: number;
    enablePagination?: boolean;
    enableSearchBar?: boolean;
    enableExport?: boolean;
    searchBarField?: any[];
    enableReload?: boolean;
    addBtn?: boolean;
    addBtnTitle?: string;
    actions?: TableAction[] = [];
    customData?: any;
    expandable?: boolean;

    constructor(obj: any = {}) {
        this.title = obj.title;
        this.titleTooltip = obj.titleTooltip;
        this.loading = obj.loading;
        this.selectByCheckBox = obj.selectByCheckBox;
        this.selectByRadio = obj.selectByRadio;
        this.rowSelect = obj.rowSelect;
        this.key = obj.key;
        this.dataKey = obj.dataKey;
        this.displayAction = obj.displayAction;
        this.paginationRow = obj.paginationRow;
        this.enablePagination = obj.enablePagination ?? true;
        this.enableSearchBar = obj.enableSearchBar ?? true;
        this.enableExport = obj.enableExport;
        this.searchBarField = obj.searchBarField;
        this.enableReload = obj.enableReload;
        this.addBtn = obj.addBtn;
        this.addBtnTitle = obj.addBtnTitle;
        this.actions = obj.actions;
        this.customData = obj.customData;
        this.expandable = obj.expandable;
    }
}

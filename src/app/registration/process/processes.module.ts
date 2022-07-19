import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { CoreModule } from "@app/core/core.module";
import { TransactionsRoutingModule } from "@app/workstation/transactions/transactions-routing.module";
import { TranslateModule } from "@ngx-translate/core";
import { NgxUiLoaderModule } from "ngx-ui-loader";
import { ProcessesComponent } from "./processes.component";

@NgModule({
    declarations: [ProcessesComponent],
    imports: [ CommonModule, NgxUiLoaderModule, TransactionsRoutingModule, TranslateModule, CoreModule],
    exports: [ProcessesComponent],
})
export class ProcessesModule {}

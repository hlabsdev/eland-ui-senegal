import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RrrsFormRoutingModule } from './rrrs-form-routing.module';
import { RrrsFormComponent } from './rrrs.form.component';
import { LazyWorkSpaceModule } from '@app/workstation/lazyWorkspace.module';
import { WorkstationModule } from '@app/workstation/workstation.module';

@NgModule({
    declarations: [RrrsFormComponent],
    imports: [CommonModule, RrrsFormRoutingModule, LazyWorkSpaceModule, WorkstationModule],
    exports: [RrrsFormComponent],
})
export class RrrsFormModule {}

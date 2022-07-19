import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '@app/core/core.module';
import { quicklinksReducer } from '@app/features/quicklink/store/quicklink.reducers';
import { AddQuicklinkComponent } from '@features/quicklink/components/actions-quicklink-dialog/actions-quicklink-dialog.component';
import { QuicklinksComponent } from '@features/quicklink/components/quicklinks/quicklinks.component';
import { QuicklinkEffects } from '@features/quicklink/store/quicklink.effects';
import { quicklinkKey } from '@features/quicklink/store/quicklink.reducers';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [QuicklinksComponent, AddQuicklinkComponent],
    imports: [
        ReactiveFormsModule,
        CoreModule,
        TranslateModule,
        StoreModule.forFeature(quicklinkKey, quicklinksReducer),
        EffectsModule.forFeature([QuicklinkEffects]),
    ],
    exports: [QuicklinksComponent],
    providers: []
})
export class QuicklinkModule {}

import { NgModule } from '@angular/core';
import { TranslationService } from '@app/translation/translation.service';
import { TranslationRepository } from '@app/translation/translation.repository';

@NgModule({
    providers: [TranslationService, TranslationRepository],
})
export class TranslationModule {}

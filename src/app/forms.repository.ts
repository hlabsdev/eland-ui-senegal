import { Injectable } from '@angular/core';
import { RepositoryDataService } from '@app/data/models/repositoryDataService.model';
import { DataElement } from '@app/data/models/dataElement.model';
import { Repository } from '@app/data/models/repository.model';
import { environment as config } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Form } from '@app/core/models/form.model';

@Injectable()
export class FormsRepository extends Repository implements RepositoryDataService {
    services = this.getServices<Form>('forms', (e) => new Form(e));

    constructor(http: HttpClient, private translateService: TranslateService) {
        super(http, config.translationApi);
    }

    getDataServices = (): DataElement => ({
        name: 'forms',
        serviceNames: ['locales', 'language'],
        fn: this.services.getAll,
    });
}

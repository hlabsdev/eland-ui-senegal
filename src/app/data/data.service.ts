import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Form } from '@app/core/models/form.model';
import { FormService } from '@app/core/services/form.service';
import { DataCollection } from './dataCollection.model';
import { environment as config } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { EventSourceService } from '@app/core/utils/eventSource.service';
import { DataCollectionCall } from '@app/data/dataCollectionCall.model';
import { TranslateService } from '@ngx-translate/core';
import { RepositoryDataService } from '@app/data/models/repositoryDataService.model';
import { fn$ } from '@app/data/models/fn$.model';

@Injectable()
export class DataService {
    dataServiceUrls = [config.translationApi + '/data/services'];

    private forms: DataCollection<Form, string> = new DataCollection<Form, string>();
    private dataServices: DataCollectionCall<any> = new DataCollectionCall<any>();

    constructor(
        private formService: FormService,
        private http: HttpClient,
        private eventSourceService: EventSourceService,
        private translateService: TranslateService,
    ) {
        this.initDataServices();
        this.loadDateServices();
    }

    getFormByName(name: string): Observable<Form> {
        return this.forms.get$(name).pipe(
            mergeMap((form) => {
                if (form) {
                    return of(form);
                } else {
                    return this.formService.getFormByName(name).pipe(
                        map((lForm) => {
                            this.forms.set(name, lForm);
                            return lForm;
                        }),
                    );
                }
            }),
        );
    }

    initDataServices() {
        this.dataServices.get$('languageJSON').subscribe((lang) => {
            if (lang) {
                this.translateService.setTranslation('fr-SN', lang, true);
            }
        });
    }

    addDataElement = (name: string, serviceNames: string[], fn: fn$) =>
        this.dataServices.addElement({ name, serviceNames, fn });
    getDataElement$ = (name: string) => this.dataServices.get$(name);

    loadDateServices() {
        this.dataServiceUrls.forEach((dataServiceUrl) => {
            const event = this.eventSourceService.EventSource(dataServiceUrl);
            event.addEventListener('message', (dataTypeObject: any) => {
                if (dataTypeObject && dataTypeObject.data) {
                    this.dataServices.update(JSON.parse(dataTypeObject.data));
                }
            });
        });
    }

    getArray = <T = any>(items: T | T[]): T[] => (Array.isArray(items) ? items : [items]);

    loadRepositories(repos: RepositoryDataService | RepositoryDataService[]) {
        this.getArray(repos).forEach((repo) => {
            this.getArray(repo.getDataServices()).forEach((service) => {
                if (service.baseOn) {
                    this.getDataElement$(service.baseOn).subscribe((baseOnResult) => {
                        const names: string[] = (baseOnResult && this.getArray(service.baseOnFn(baseOnResult))) || [];
                        this.dataServices.removeSomeCollSomeFiltered(
                            service.name,
                            (name) => !names.includes(service.name + name),
                        );
                        names.forEach((name) => {
                            const dataElementService = {
                                ...service,
                                name: service.baseName + name,
                                fn: service.baseFn(name),
                            };
                            if (service.subscriberFn) {
                                this.dataServices.addElement(dataElementService).subscribe(service.subscriberFn);
                            } else if (service.contextSubscriberFn) {
                                this.dataServices
                                    .addElement(dataElementService)
                                    .subscribe(service.contextSubscriberFn(name));
                            } else {
                                this.dataServices.addElement(dataElementService);
                            }
                        });
                    });
                } else {
                    this.dataServices.addElement(service);
                }
            });
        });
    }
}

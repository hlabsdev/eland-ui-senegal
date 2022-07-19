import { throwError as observableThrowError, Observable, of, forkJoin } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';
import { TabView } from 'primeng/tabview';
import { Component, OnInit, ViewChildren, ViewChild, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { ValidationService } from '@app/core/utils/validation.service';
import { Config } from './config';
import { ConfigService } from './config.service';

@Component({
    templateUrl: './config.component.html',
})
export class ConfigComponent implements OnInit {
    config: Config;
    @ViewChildren('childComponent') childComponents: QueryList<any>;
    @ViewChild('tabView') tabs: TabView;

    constructor(
        public router: Router,
        private validationService: ValidationService,
        private alertService: AlertService,
        private configService: ConfigService,
    ) {}

    saveConfig(config, event) {
        event.preventDefault();
        this.validateForms()
            .pipe(
                mergeMap((errors) =>
                    this.configService.updateConfig(config).pipe(
                        catchError((error) => {
                            this.alertService.apiError(error);
                            return error;
                        }),
                    ),
                ),
            )
            .subscribe(
                (success) => {
                    this.alertService.success('API_MESSAGES.SAVE_SUCCESSFUL');
                    this.router.navigate(['home']);
                },
                (err) => this.alertService.error(err),
            );
    }

    validateForms(): Observable<any> {
        const validationObs = this.childComponents.map((comp, index) => {
            const errorResult = comp.validate();
            if (errorResult) {
                this.tabs.activeIndex = index;
                this.alertService.error(errorResult.message, errorResult.params);
                return observableThrowError(errorResult.message);
            } else {
                return of(null);
            }
        });
        return forkJoin(validationObs);
    }

    ngOnInit(): void {
        this.configService.getConfig().subscribe(
            (configObj) => {
                this.config = configObj;
            },
            (err) => this.alertService.apiError(err),
        );
    }
}

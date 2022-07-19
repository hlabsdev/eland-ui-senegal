import { Component, OnInit } from '@angular/core';
import { environment as config } from 'environments/environment';

@Component({
    selector: 'app-footer',
    templateUrl: './app.footer.component.html',
})
export class AppFooterComponent implements OnInit {
    config = config;
    printDevClue = config.production;
    devClue: string;

    constructor() {}

    ngOnInit() {
        switch (config.environment) {
            case 'local':
                this.devClue = 'local-foncier';
                break;
            case 'qa':
                this.devClue = 'qa-foncier';
                break;
            case 'prod':
                this.devClue = 'prod-foncier';
                break;
            case 'pp-ml':
                this.devClue = 'pp-ms-foncier';
                break;
            case 'no-tt':
                this.devClue = 'no-tt-foncier';
                break;
            case 'dev':
                this.devClue = 'dev-sgf-foncier';
                break;
            case 'dev-sn':
                this.devClue = 'dev-sn-foncier';
                break;
            default:
                this.devClue = 'dev-foncier';
        }
    }
}

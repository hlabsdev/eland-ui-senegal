import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { ConfigService } from '@app/core/app-config/config.service';
import * as _ from 'lodash';

@Injectable()
export class SigtasUtilService {
    constructor(
        protected configService: ConfigService,
        protected alertService: AlertService,
        protected keycloakAngular: KeycloakService,
    ) {}

    openSigtasWindow(path: string) {
        this.configService.getConfig().subscribe((config) => {
            const sigtasConfig = _.get(config, 'EXTERNAL_SERVICES.sigtas', null);
            if (sigtasConfig) {
                const url =
                    `${sigtasConfig.domain}${sigtasConfig.path}${path}` +
                    `&access_token=${this.keycloakAngular.getKeycloakInstance().token}`;
                return window.open(url, '_blank');
            }

            this.alertService.error('MESSAGES.MISSING_SIGTAS_CONFIGURATION');
        });
    }
}

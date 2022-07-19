import { environment as config } from 'environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { throwError as observableThrowError, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { EnterpriseInfo } from '@app/core/models/enterpriseInfo.model';
import { IndividualInfo } from '@app/core/models/individualInfo.model';
import { TaxPayerType } from '@app/core/models/taxPayerType.model';
import { LanguageService } from './language.service';

import { set } from 'lodash';

import { HTTP_STATUS_CODE, HTTP_ERROR_CODE_MAP } from '../../core/utils/http.constants';

@Injectable()
export class SigtasService {
    private endpointUrl = `${config.api}/v1/sigtas`;

    constructor(private http: HttpClient, private lang: LanguageService) {}

    options: {} = this.lang.setLangCodeParam();

    getTaxPayerTypes(): Observable<TaxPayerType[]> {
        return this.http.get<TaxPayerType[]>(`${this.endpointUrl}/taxPayerTypes`, this.options).pipe(
            map((response) => response.map((r) => new TaxPayerType(r))),
            catchError(this.handleError),
        );
    }

    getIndividualInfo(id: string): Observable<IndividualInfo> {
        return this.http.get<IndividualInfo>(`${this.endpointUrl}/individuals/${id}`, this.options).pipe(
            map((response) => new IndividualInfo(response)),
            catchError(this.handleError),
        );
    }

    getEnterpriseInfo(id: string): Observable<EnterpriseInfo> {
        return this.http.get<EnterpriseInfo>(`${this.endpointUrl}/enterprises/${id}`, this.options).pipe(
            map((response) => new EnterpriseInfo(response)),
            catchError(this.handleError),
        );
    }

    private handleError(error: any) {
        if (error.status) {
            if (Object.values(HTTP_STATUS_CODE).includes(error.status)) {
                set(error, 'code', HTTP_ERROR_CODE_MAP[error.status]);
            } else {
                set(error, 'code', 'SERVER_CONNECT_ERROR');
            }
        }
        return observableThrowError(error);
    }
}

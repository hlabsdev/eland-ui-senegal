import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApplicationService } from '@app/core/services/application.service';
import { RdaiService } from '@app/core/services/rdai.service';
import { Application } from '@app/core/models/application.model';
import { PaginatedResults } from '@app/core/models/paginatedResults.model';
import { Rdai } from '@app/core/models/rdai.model';
import Utils from '@app/core/utils/utils';
import { environment as config } from 'environments/environment';
import { forkJoin, Observable, of, throwError as observableThrowError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { BAUnit } from '@app/workstation/baUnit/baUnit.model';
import { BAUnitService } from '@app/workstation/baUnit/baUnit.service';
import { PreregistrationFormality } from './preregistrationFormality.model';
import { withCache } from '@ngneat/cashew';

@Injectable()
export class PreregistrationFormalityService {
    private endpointUrl = `${config.api}/sn/v1`;

    constructor(
        private http: HttpClient,
        private baUnitService: BAUnitService,
        private rdaiService: RdaiService,
        private applicationService: ApplicationService,
    ) {}

    /**
     * catch error
     *
     * @param error
     */
    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }

    getPreregistrationFormalities(args: any = {}): Observable<PreregistrationFormality[]> {
        return this.http
            .get<PreregistrationFormality[]>(`${this.endpointUrl}/preregistration-formalities`, withCache())
            .pipe(
                map((formArr: PreregistrationFormality[]) => formArr.map((form) => new PreregistrationFormality(form))),
                catchError(this.handleError),
            );
    }

    getAllPreregistrationFormalities(args: any = {}): Observable<PaginatedResults> {
        let params = new HttpParams();

        params = Utils.setParamsFromArgs(params, args);

        return this.http.get<PaginatedResults>(`${this.endpointUrl}/preregistration-formalities`, { params }).pipe(
            map((response) => {
                response.content = response.content.map((rfp) => new PreregistrationFormality(rfp));

                return new PaginatedResults(response);
            }),
            catchError(this.handleError),
        );
    }

    getPreregistrationFormality(args: any = {}): Observable<PreregistrationFormality> {
        return this.http
            .get<PreregistrationFormality>(`${this.endpointUrl}/preregistration-formalities/${args.id}`)
            .pipe(
                map((form: PreregistrationFormality) => new PreregistrationFormality(form)),
                catchError(this.handleError),
            );
    }

    savePregistrationFormality(
        preregistrationFormality: PreregistrationFormality,
    ): Observable<PreregistrationFormality> {
        return this.http.put<PreregistrationFormality>(
            `${this.endpointUrl}/preregistration-formalities/${preregistrationFormality.id}`,
            preregistrationFormality,
        );
    }

    createPregistrationFormality = (
        preregistrationFormality: PreregistrationFormality,
    ): Observable<PreregistrationFormality> =>
        this.http.post(`${this.endpointUrl}/preregistration-formalities`, preregistrationFormality).pipe(
            map((response: PreregistrationFormality) => new PreregistrationFormality(response)),
            catchError(this.handleError),
        );

    assignPrePopulatedData(
        formVariables: FormVariables,
        preregistrationFormality: PreregistrationFormality = new PreregistrationFormality(),
    ): Observable<PreregistrationFormality> {
        const baUnit: BAUnit = formVariables.getPath('baUnit.uid') && formVariables.getPath('baUnit');
        const baUnitId: string = formVariables.getPath('baUnitId');
        const rdaiId: string = formVariables.getPath('rdaiId');
        const rdai: Rdai = formVariables.getPath('rdai');
        const applicationId: string = formVariables.getPath('applicationId');

        if (!preregistrationFormality.executionBoundaryDelimitationDate) {
            preregistrationFormality.executionBoundaryDelimitationDate = Utils.setDate(
                formVariables.getPath('boundariesDate'),
            );
        }

        if (!preregistrationFormality.registerDepositDate) {
            preregistrationFormality.registerDepositDate = Utils.setDate(formVariables.getPath('requisitionDate'));
        }

        if (!preregistrationFormality.transmissionDateION) {
            preregistrationFormality.transmissionDateION = Utils.setDate(formVariables.getPath('journalSendDate'));
        }

        if (!preregistrationFormality.transmissionDateCH) {
            preregistrationFormality.transmissionDateCH = Utils.setDate(formVariables.getPath('courtSendDate'));
        }

        if (!preregistrationFormality.sendingDateIN) {
            preregistrationFormality.sendingDateIN = Utils.setDate(formVariables.getPath('attorneySendDate'));
        }

        if (!preregistrationFormality.sendingDatePB) {
            preregistrationFormality.sendingDatePB = Utils.setDate(formVariables.getPath('mayorSendDate'));
        }

        if (!preregistrationFormality.insertionDateION) {
            preregistrationFormality.insertionDateION = Utils.setDate(formVariables.getPath('individualSendDate'));
        }

        const unitObs$: Observable<BAUnit> = baUnit
            ? of(baUnit)
            : baUnitId
            ? this.baUnitService.getBAUnitById(baUnitId)
            : of(null);

        const rdaiObs$: Observable<Rdai> = rdai ? of(rdai) : rdaiId ? this.rdaiService.getRdaiById(rdaiId) : of(null);

        const applicationObs$: Observable<Application> = applicationId
            ? this.applicationService.getApplication(applicationId)
            : of(null);

        return forkJoin([unitObs$, rdaiObs$, applicationObs$]).pipe(
            map(([unit, rdaiValue, application]) =>
                preregistrationFormality.assignPrePopulatedData(unit, rdaiValue, application),
            ),
        );
    }
}

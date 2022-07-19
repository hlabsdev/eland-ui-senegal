import { withCache } from '@ngneat/cashew';
import { HttpClient, HttpParams } from '@angular/common/http';
import { throwError as observableThrowError, Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment as config } from 'environments/environment';
import { map, catchError, mergeMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { BAUnit } from './baUnit.model';
import { PaginatedResults } from '@app/core/models/paginatedResults.model';
import { RoleChange } from '@app/core/models/roleChange.model';
import { RegistryRecord } from '@app/core/models/registryRecord.model';
import { CodeList } from '@app/core/models/codeList.model';
import { Right } from '../rrr/right/right.model';
import { FoncierApiHttpErrorResponse } from '@app/core/models/foncierApiHttpErrorResponse.model';
import Utils from '@app/core/utils/utils';

@Injectable()
export class BAUnitService {
    private endpointUrl = `${config.api}`;
    private countrySpecificUrl = '/sn/v1/ba-units';
    private requestUrl = this.endpointUrl + this.countrySpecificUrl;

    constructor(private http: HttpClient) {}

    getBAUnits(args: any = {}): Observable<PaginatedResults> {
        let params = new HttpParams();
        if (args.registered) {
            params = params.set('isRegistered', String(args.registered));
            if (args.withoutActiveTransactions) {
                params = params.set('withoutActiveTransactions', String(args.withoutActiveTransactions));
            }
        }
        if (args.search) {
            const value = String(args.search);
            if (value.indexOf('/') > -1) {
                const values: string[] = value.split('/');
                params = params.set('titleId', values[0]);
                params = params.set('registryCode', values[1].toUpperCase());
            } else {
                params = params.set('titleId', args.search);
                params = params.set('registryCode', args.search.toUpperCase());
            }
        }

        params = Utils.setParamsFromArgs(params, args);

        return this.http.get<PaginatedResults>(this.requestUrl, { params }).pipe(
            map((response) => {
                response.content = response.content.map((baUnit) => new BAUnit(baUnit));
                return new PaginatedResults(response);
            }),
            catchError(this.handleError),
        );
    }

    getRegisteredBAUnits(args: any = {}): Observable<PaginatedResults> {
        args.registered = true;
        return this.getBAUnits(args);
    }

    getBAUnitById(id: string, args = {}): Observable<BAUnit> {
        let params = new HttpParams();
        _.mapKeys(args, (value, key) => (params = params.set(key, value)));

        return this.http.get(`${this.requestUrl}/${id}`, { params }).pipe(
            map((response: BAUnit) => new BAUnit(response)),
            catchError(this.handleError),
        );
    }

    getBAUnit(baUnit: BAUnit, args = {}): Observable<BAUnit> {
        let params = new HttpParams();
        _.mapKeys(args, (value, key) => (params = params.set(key, value)));

        return this.http.get(`${this.requestUrl}/${baUnit.uid}`, { params }).pipe(
            map((response: BAUnit) => new BAUnit(response)),
            catchError(this.handleError),
        );
    }

    updateBAUnit(args: any = {}): Observable<BAUnit> {
        const { baUnit, baUnitFormFieldsRequired } = args;

        return this.http.put(`${this.requestUrl}/${baUnit.uid}`, baUnit, { params: { baUnitFormFieldsRequired } }).pipe(
            map((response: BAUnit) => new BAUnit(response)),
            catchError(this.handleError),
        );
    }

    createBAUnit(args: { baUnit?: BAUnit; baUnitFormFieldsRequired?: any } = {}): Observable<BAUnit> {
        const { baUnit, baUnitFormFieldsRequired } = args;

        return this.http.post(this.requestUrl, baUnit, { params: { baUnitFormFieldsRequired } }).pipe(
            map((response: BAUnit) => new BAUnit(response)),
            catchError(this.handleError),
        );
    }

    cloneBAUnit(baUnit: BAUnit, creationMode: CodeList, generateTitleNumber = false): Observable<BAUnit> {
        const newBAUnit = baUnit.cloneBasicInfos(creationMode, generateTitleNumber);
        return generateTitleNumber
            ? this.getNextAvailableRegistryRecordId(newBAUnit).pipe(
                  mergeMap((registry) =>
                      this.createBAUnit({
                          baUnit: newBAUnit.setNewRegistryPreset(registry),
                          baUnitFormFieldsRequired: false,
                      }),
                  ),
              )
            : this.createBAUnit({ baUnit: newBAUnit, baUnitFormFieldsRequired: false });
    }

    private handleError(error: FoncierApiHttpErrorResponse) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }

    getNextAvailableRegistryRecordId(baUnit: BAUnit): Observable<RegistryRecord> {
        return this.http.get(`${this.requestUrl}/registry/${baUnit.registryRecord.registry.id}`).pipe(
            map((response: RegistryRecord) => new RegistryRecord(response)),
            catchError(this.handleError),
        );
    }

    getBAUnitHistory(baUnit: BAUnit): Observable<BAUnit[]> {
        return this.http.get(`${this.requestUrl}/history/${baUnit.uid}`).pipe(
            map((response: BAUnit[]) => response.map((resp) => new BAUnit(resp))),
            catchError(this.handleError),
        );
    }

    getMortgageAssociableRights(baUnit: BAUnit): Observable<Right[]> {
        if (!baUnit || !baUnit.uid) {
            return of(new Array<Right>());
        }

        let params = new HttpParams();
        params = params.set('type', 'mortgage');

        return this.http.get(`${this.requestUrl}/${baUnit.uid}/rrrs`, { params }).pipe(
            map((response: Right[]) => response.map((resp) => new Right(resp))),
            catchError(this.handleError),
        );
    }

    getRoleChanges(baUnit: BAUnit): Observable<RoleChange[]> {
        return this.http.get(`${this.requestUrl}/${baUnit.uid}/role-changes`).pipe(
            map((response: RoleChange[]) => response.map((r) => new RoleChange(r))),
            catchError(this.handleError),
        );
    }

    updateRoleChanges(baUnit: BAUnit): Observable<BAUnit> {
        return this.http.put(`${this.requestUrl}/${baUnit.uid}/role-changes`, {}).pipe(
            map((response) => new BAUnit(response)),
            catchError(this.handleError),
        );
    }
}

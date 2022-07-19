import { HttpClient, HttpParams } from '@angular/common/http';
import { throwError as observableThrowError, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { RRR } from './rrr.model';
import { Injectable } from '@angular/core';
import { environment as config } from 'environments/environment';
import { RRRType, RRRTypeEnum } from '../rrrType/rrrType.model';
import { RightType, RightTypeEnum } from '../rightType/rightType.model';
import { ResponsibilityType, ResponsibilityTypeEnum } from '../responsibilityType/responsibilityType.model';
import { RestrictionType, RestrictionTypeEnum } from '../restrictionType/restrictionType.model';
import { ModelFactory } from '@app/core/utils/model.factory';
import { withCache } from '@ngneat/cashew';

@Injectable()
export class RRRService {
    private endpointUrl = `${config.api}/v1`;
    private rrrEndpointUrl = `${config.api}/sn/v1`;

    constructor(private http: HttpClient) {}

    getRRRTypes(args: any = {}): Observable<RRRType[]> {
        return this.http.get(`${this.endpointUrl}/rrr-types`, withCache()).pipe(
            map((response: RRRTypeEnum[]) => response.map((rrrType) => new RRRType(rrrType))),
            catchError(this.handleError),
        );
    }

    getRightSubTypes(args: any = {}): Observable<RightType[]> {
        return this.http.get(`${this.endpointUrl}/rrr-types/right-types`, withCache()).pipe(
            map((response: RightTypeEnum[]) => response.map((rightType) => new RightType(rightType))),
            catchError(this.handleError),
        );
    }

    getRestrictionSubTypes(args: any = {}): Observable<RestrictionType[]> {
        return this.http.get(`${this.endpointUrl}/rrr-types/restriction-types`, withCache()).pipe(
            map((response: RestrictionTypeEnum[]) =>
                response.map((restrictionType) => new RestrictionType(restrictionType)),
            ),
            catchError(this.handleError),
        );
    }

    getResponsibilitySubTypes(args: any = {}): Observable<ResponsibilityType[]> {
        return this.http.get(`${this.endpointUrl}/rrr-types/responsibility-types`, withCache()).pipe(
            map((response: ResponsibilityTypeEnum[]) =>
                response.map((responsibilityType) => new ResponsibilityType(responsibilityType)),
            ),
            catchError(this.handleError),
        );
    }

    getRRR(rrrId: string): Observable<RRR> {
        return this.http.get(`${this.rrrEndpointUrl}/rrrs/${rrrId}`).pipe(
            map((response: RRR) => ModelFactory.manageRRRPolymorphism(response)),
            catchError(this.handleError),
        );
    }

    updateRRR(rrr: RRR): Observable<RRR> {
        return this.http.put(`${this.rrrEndpointUrl}/rrrs/${rrr.rid}`, rrr).pipe(
            map((response: RRR) => ModelFactory.manageRRRPolymorphism(response)),
            catchError(this.handleError),
        );
    }

    createRRR(rrr: RRR): Observable<RRR> {
        return this.http.post(`${this.rrrEndpointUrl}/rrrs`, rrr).pipe(
            map((response: RRR) => ModelFactory.manageRRRPolymorphism(response)),
            catchError(this.handleError),
        );
    }

    getRRRs(args: any = {}): Observable<RRR[]> {
        const params = new HttpParams();

        if (args.search) {
            params.set('search', args.search);
        }

        return this.http.get(`${this.rrrEndpointUrl}/rrrs`, { params }).pipe(
            map((response: RRR[]) => response.map(ModelFactory.manageRRRPolymorphism)),
            catchError(this.handleError),
        );
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }
}

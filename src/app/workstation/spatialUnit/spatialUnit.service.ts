import { throwError as observableThrowError, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Parcel } from './parcel/parcel.model';
import { SpatialUnit } from './spatialUnit.model';
import { Injectable } from '@angular/core';
import { environment as config } from 'environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ModelFactory } from '@app/core/utils/model.factory';
import { SpatialUnitType } from './spatialUnitType.model';
import { withCache } from '@ngneat/cashew';

@Injectable()
export class SpatialUnitService {
    private endpointUrl = `${config.api}/v1`;

    constructor(private http: HttpClient) {}

    getSpatialUnitTypes(args: any = {}): Observable<SpatialUnitType[]> {
        return this.http.get(`${this.endpointUrl}/spatial-unit-types`, withCache()).pipe(
            map((response: any[]) => response.map((spatialUnitType) => new SpatialUnitType(spatialUnitType))),
            catchError(this.handleError),
        );
    }

    getSpatialUnit(spatialUnitId: string): Observable<SpatialUnit> {
        return this.http.get(`${this.endpointUrl}/spatial-units/${spatialUnitId}`).pipe(
            map((response: Response) => ModelFactory.manageSpatialUnitPolymorphism(response)),
            catchError(this.handleError),
        );
    }

    updateSpatialUnit(spatialunit: SpatialUnit): Observable<SpatialUnit> {
        return this.http
            .put(
                `${this.endpointUrl}/spatial-units/${spatialunit.suid}`,
                ModelFactory.manageSpatialUnitPolymorphism(spatialunit),
            )
            .pipe(
                map((response: SpatialUnit) => ModelFactory.manageSpatialUnitPolymorphism(response)),
                catchError(this.handleError),
            );
    }

    createSpatialUnit(spatialunit: SpatialUnit): Observable<SpatialUnit> {
        return this.http
            .post(`${this.endpointUrl}/spatial-units`, ModelFactory.manageSpatialUnitPolymorphism(spatialunit))
            .pipe(
                map((response: SpatialUnit) => ModelFactory.manageSpatialUnitPolymorphism(response)),
                catchError(this.handleError),
            );
    }

    createParcel(parcel: Parcel): Observable<Parcel> {
        return this.http
            .post<Parcel>(`${this.endpointUrl}/spatial-units`, ModelFactory.manageSpatialUnitPolymorphism(parcel))
            .pipe(
                map((response: Parcel) => <Parcel>ModelFactory.manageSpatialUnitPolymorphism(response)),
                catchError(this.handleError),
            );
    }

    getSpatialUnits(args: any = {}): Observable<SpatialUnit[]> {
        const params = new HttpParams();

        if (args.search) {
            params.set('search', args.search);
        }

        return this.http.get(`${this.endpointUrl}/spatial-units`, { params }).pipe(
            map((response: any[]) => response.map((su) => ModelFactory.manageSpatialUnitPolymorphism(su))),
            catchError(this.handleError),
        );
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }
}

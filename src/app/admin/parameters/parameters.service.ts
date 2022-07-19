import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SelectItem } from 'primeng/api';
import { environment as config } from '../../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import { throwError as observableThrowError } from 'rxjs/internal/observable/throwError';
import { Selectable } from '@app/core/interfaces/selectable.interface';
import { District } from '@app/core/models/territory/district.model';
import { Observable } from 'rxjs';
import { Circle } from '@app/core/models/territory/circle.model';
import { Division } from '@app/core/models/territory/division.model';
import { Region } from '@app/core/models/territory/region.model';
import { Country } from '@app/core/models/territory/country.model';
import { Territory } from '@app/core/models/territory/territory.model';
import { TerritorySection } from '@app/core/models/territory/territorySection.model';
import { ResponsibleOffice } from '@app/core/models/responsibleOffice.model';
import { Registry } from '@app/core/models/registry.model';
import { KeycloakRoles } from '@app/core/models/keycloakRoles.model';
import { TaxCenter } from '@app/core/models/taxCenter.model';
import { CacheBucket, HttpCacheManager, withCache } from '@ngneat/cashew';

@Injectable()
export class ParametersService {
    private endpointUrl = `${config.api}/v1`;
    private endpointSigtasUrl = `${config.api}/v1/sigtas`;
    private regionsBucket = new CacheBucket();
    private countriesBucket = new CacheBucket();
    private circlesBucket = new CacheBucket();
    private districtsBucket = new CacheBucket();
    private divisionsBucket = new CacheBucket();
    private registriesBucket = new CacheBucket();
    private responsibleOfficesBucket = new CacheBucket();

    constructor(private http: HttpClient, private manager: HttpCacheManager) {}

    getAllTaxCentersFromSigtas(): Observable<TaxCenter[]> {
        return this.http
            .get<TaxCenter[]>(`${this.endpointSigtasUrl}/taxCenters`, withCache())
            .pipe(map((taxCenters) => taxCenters.map((taxCenter) => new TaxCenter(taxCenter))));
    }

    //#region --- territory ---

    //#region -- District --

    getAllTerritoryBySection(section: TerritorySection, only?: boolean): Observable<Territory[]> {
        switch (section) {
            case TerritorySection.COUNTRY:
                return this.getAllCountry();
            case TerritorySection.REGION:
                return this.getAllRegion(only);
            case TerritorySection.CIRCLE:
                return this.getAllCircle(only);
            case TerritorySection.DIVISION:
                return this.getAllDivision(only);
            case TerritorySection.DISTRICT:
                return this.getAllDistrict(only);
        }
    }

    getAllDistrict(only?: boolean): Observable<District[]> {
        return this.http
            .get<District[]>(
                `${this.endpointUrl}/district${only ? '/only' : ''}`,
                withCache({
                    bucket$: this.districtsBucket,
                }),
            )
            .pipe(
                map((districts) => districts.map((district) => new District(district))),
                catchError(this.handleError),
            );
    }
    getDistrictOnly(only?: boolean): Observable<District> {
        return this.http.get<District>(`${this.endpointUrl}/district${only ? '/only' : ''}`).pipe(
            map((district) => new District(district)),
            catchError(this.handleError),
        );
    }
    saveDistrict(district: District, only?: boolean): Observable<District> {
        this.manager.delete(this.districtsBucket);
        return this.saveBuilder(district, `/district${only ? '/only' : ''}`).pipe(
            map((newDistrict) => new District(newDistrict)),
            catchError(this.handleError),
        );
    }

    //#endregion -- District --
    //#region -- Division --

    getAllDivision(only?: boolean): Observable<Division[]> {
        return this.http
            .get<Division[]>(
                `${this.endpointUrl}/division${only ? '/only' : ''}`,
                withCache({
                    bucket$: this.divisionsBucket,
                }),
            )
            .pipe(
                map((divisions) => divisions.map((division) => new Division(division))),
                catchError(this.handleError),
            );
    }
    getDivision(only?: boolean) {
        return this.http.get<Division>(`${this.endpointUrl}/division${only ? '/only' : ''}`).pipe(
            map((division) => new Division(division)),
            catchError(this.handleError),
        );
    }
    saveDivision(division: Division): Observable<Division> {
        this.manager.delete(this.divisionsBucket);
        return this.saveBuilder(division, '/division').pipe(
            map((newDivision) => new Division(newDivision)),
            catchError(this.handleError),
        );
    }

    //#endregion -- Division --
    //#region -- Circle --

    getAllCircle(only?: boolean) {
        return this.http
            .get<Circle[]>(
                `${this.endpointUrl}/circle${only ? '/only' : ''}`,
                withCache({
                    bucket$: this.circlesBucket,
                }),
            )
            .pipe(
                map((circles) => circles.map((circle) => new Circle(circle))),
                catchError(this.handleError),
            );
    }
    getCircle(only?: boolean) {
        return this.http.get<Circle>(`${this.endpointUrl}/circle${only ? '/only' : ''}`).pipe(
            map((circle) => new Circle(circle)),
            catchError(this.handleError),
        );
    }

    saveCircle(circle: Circle, only?: boolean): Observable<Circle> {
        this.manager.delete(this.circlesBucket);
        return this.saveBuilder(circle, `/circle${only ? '/only' : ''}`).pipe(
            map((newCircle) => new Circle(newCircle)),
            catchError(this.handleError),
        );
    }

    //#endregion -- Circle --
    //#region -- Region --

    getAllRegion(only?: boolean) {
        return this.http
            .get<Region[]>(
                `${this.endpointUrl}/region${only ? '/only' : ''}`,
                withCache({
                    bucket$: this.regionsBucket,
                }),
            )
            .pipe(
                map((regions) => regions.map((region) => new Region(region))),
                catchError(this.handleError),
            );
    }
    getRegion(only?: boolean) {
        return this.http.get<Region>(`${this.endpointUrl}/region${only ? '/only' : ''}`).pipe(
            map((region) => new Region(region)),
            catchError(this.handleError),
        );
    }
    saveRegion(region: Region, only?: boolean): Observable<Region> {
        this.manager.delete(this.regionsBucket);
        return this.saveBuilder(region, `/region${only ? '/only' : ''}`).pipe(
            map((newRegion) => new Region(newRegion)),
            catchError(this.handleError),
        );
    }

    //#endregion -- Region --
    //#region -- Country --

    getAllCountry() {
        return this.http
            .get<Country[]>(
                `${this.endpointUrl}/country`,
                withCache({
                    bucket$: this.countriesBucket,
                }),
            )
            .pipe(
                map((countries) => countries.map((country) => new Country(country))),
                catchError(this.handleError),
            );
    }
    getCountry() {
        return this.http.get<Country>(`${this.endpointUrl}/country`).pipe(
            map((country) => new Country(country)),
            catchError(this.handleError),
        );
    }
    saveCountry(country: Country): Observable<Country> {
        this.manager.delete(this.countriesBucket);
        return this.saveBuilder(country, '/country').pipe(
            map((newCountry) => new Country(newCountry)),
            catchError(this.handleError),
        );
    }

    //#endregion -- Country --
    //endregion ---Territory

    getAllRegistries(useResponsibleOffice = true): Observable<Registry[]> {
        return this.http
            .get<Registry[]>(
                `${this.endpointUrl}/registry`,
                withCache({
                    bucket$: this.registriesBucket,
                    useResponsibleOffice: useResponsibleOffice.toString(),
                }),
            )
            .pipe(
                map((registries) => registries.map((registry) => new Registry(registry))),
                catchError(this.handleError),
            );
    }

    saveRegistry(registry: Registry): Observable<Registry> {
        this.manager.delete(this.registriesBucket);
        return this.saveBuilder(registry, '/registry').pipe(
            map((newRegistry) => new Registry(newRegistry)),
            catchError(this.handleError),
        );
    }

    getAllResponsibleOffices(useCurrentUser = false): Observable<ResponsibleOffice[]> {
        return this.http
            .get<ResponsibleOffice[]>(
                `${this.endpointUrl}/responsibleOffice`,
                withCache({
                    bucket$: this.responsibleOfficesBucket,
                    useCurrentUser: useCurrentUser.toString(),
                }),
            )
            .pipe(
                map((responsibleOffices) =>
                    responsibleOffices.map((responsibleOffice) => new ResponsibleOffice(responsibleOffice)),
                ),
                catchError(this.handleError),
            );
    }

    saveResponsibleOffice(responsibleOffice: ResponsibleOffice): Observable<ResponsibleOffice> {
        this.manager.delete(this.responsibleOfficesBucket);
        return this.saveBuilder(responsibleOffice, '/responsibleOffice').pipe(
            map((newResponsibleOffice) => new ResponsibleOffice(newResponsibleOffice)),
            catchError(this.handleError),
        );
    }

    getAllKeycloakRoles(): Observable<KeycloakRoles[]> {
        return this.http.get<KeycloakRoles[]>(`${this.endpointUrl}/keycloakAdmin/roles`).pipe(
            map((roles) => roles.map((role) => new KeycloakRoles(role))),
            catchError(this.handleError),
        );
    }

    getSelectables(collection: Selectable[], selectTxt: string): SelectItem[] {
        const selectables = collection.map((e) => e.toSelectItem());
        selectables.unshift({ label: selectTxt, value: '', disabled: true });
        return selectables;
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }

    private saveBuilder(item: any, url: string): Observable<any> {
        let item$;
        if (item.id) {
            item$ = this.http.put<any>(`${this.endpointUrl}${url}/${item.id}`, item);
        } else {
            item$ = this.http.post<any>(`${this.endpointUrl}${url}`, item);
        }
        return item$;
    }
}

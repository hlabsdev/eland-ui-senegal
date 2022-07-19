import { throwError as observableThrowError, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as config } from 'environments/environment';
import { map, catchError } from 'rxjs/operators';
import { Publication } from '@app/core/models/publication.model';

@Injectable()
export class PublicationService {
    private apiUrl = `${config.api}`;
    private countrySpecificUrl = '/sn/v1';
    private requestUrl = this.apiUrl + this.countrySpecificUrl;

    constructor(private http: HttpClient) {}

    getPublications(args: any = {}): Observable<Publication[]> {
        const params = new HttpParams();

        if (args.search) {
            params.set('search', args.search);
        }

        return this.http.get(`${this.requestUrl}/publications`, { params }).pipe(
            map((response: any[]) => response.map((pub) => new Publication(pub))),
            catchError(this.handleError),
        );
    }

    getPublicationsByBaUnit(args: any = {}): Observable<Publication[]> {
        return this.http
            .get(`${this.requestUrl}/publications?baunitid=${args.baUnitId}&baunitversion=${args.baUnitIdVersion}`)
            .pipe(
                map((response: any[]) => response.map((pub) => new Publication(pub))),
                catchError(this.handleError),
            );
    }

    getPublication(publication: Publication): Observable<Publication> {
        return this.http.get<Publication>(`${this.requestUrl}/publications/${publication.id}`).pipe(
            map((response) => new Publication(response)),
            catchError(this.handleError),
        );
    }

    updatePublication(publication: Publication): Observable<Publication> {
        return this.http.put<Publication>(`${this.requestUrl}/publications/${publication.id}`, publication).pipe(
            map((response) => new Publication(response)),
            catchError(this.handleError),
        );
    }

    createPublication(publication: Publication): Observable<Publication> {
        return this.http.post<Publication>(`${this.requestUrl}/publications`, publication).pipe(
            map((response) => new Publication(response)),
            catchError(this.handleError),
        );
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }

    deletePublication(publicationId: string): any {
        return this.http.delete(`${this.requestUrl}/publications/${publicationId}`).subscribe(
            () => {},
            (error) => this.handleError(error),
        ); // TODO: this should be done on the component
    }
}

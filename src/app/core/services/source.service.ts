import { environment as config } from 'environments/environment';
import { SourceType } from '@app/workstation/source/sourceType.model';
import { throwError as observableThrowError, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { map, catchError } from 'rxjs/operators';
import { Source } from '@app/core/models/source.model';
import { UploadSource } from '@app/core/models/uploadSource.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';
import Utils from '@app/core/utils/utils';
import { ExtArchive } from '@app/core/models/extArchive.model';
import { PaginatedResults } from '@app/core/models/paginatedResults.model';
import { ModelFactory } from '@app/core/utils/model.factory';

@Injectable()
export class SourceService {
    private apiUrl = `${config.api}/v1`;
    private endpointUrl = `${config.api}`;
    private countrySpecificUrl = '/sn/v1';
    private requestUrl = this.endpointUrl + this.countrySpecificUrl;
    constructor(private http: HttpClient) {}

    getSources(args: any = {}): Observable<PaginatedResults> {
        let params = new HttpParams();
        if (args.transactionInstanceId) {
            params = params.set('transactionInstanceId', args.transactionInstanceId);
        }
        if (args.baUnitId) {
            params = params.set('baUnitId', args.baUnitId);
        }
        if (args.page) {
            params = params.set('page', args.page);
        }
        if (args.perPage) {
            params = params.set('perPage', args.perPage);
        }
        if (args.orderBy) {
            params = params.set('orderBy', args.orderBy);

            if (args.direction) {
                if (args.direction === -1) {
                    params = params.set('direction', 'ASC');
                } else {
                    params = params.set('direction', 'DESC');
                }
            }
        }

        return this.http.get<PaginatedResults>(`${this.requestUrl}/sources`, { params }).pipe(
            map((response) => {
                response.content = response.content.map((source) => ModelFactory.manageSourcePolymorphism(source));
                return new PaginatedResults(response);
            }),
            catchError(this.handleError),
        );
    }

    getAllSourceTypes(args: any = {}): Observable<SourceType[]> {
        return this.http.get<any[]>(`${this.requestUrl}/sources/source-types`).pipe(
            map((response) => response.map((st) => new SourceType(st))),
            catchError(this.handleError),
        );
    }

    getDocumentById(source: Source): Observable<Blob> {
        const folderPath = source.extArchive.folder;

        if (folderPath.startsWith('LinkFile:')) {
            return this.http
                .get(`${this.apiUrl}/documents/files/${source.extArchive.sid}`, { responseType: 'blob' })
                .pipe(
                    map((response) => {
                        const file: any = Utils.getFileMimeType(source.extArchive.fileName);
                        return new Blob([response], { type: file.type });
                    }),
                    catchError(this.handleError),
                );
        } else {
            const formdata = `{"folderName": "${folderPath}","fileName": "${source.extArchive.fileName}"}`;

            return this.http.post(`${this.apiUrl}/documents/files`, formdata, { responseType: 'blob' }).pipe(
                map((response) => {
                    const file: any = Utils.getFileMimeType(source.extArchive.fileName);
                    return new Blob([response], { type: file.type }); // TODO: Should we return this?
                }),
                catchError(this.handleError),
            );
        }
    }

    signPdfDocument(source: Source, electronicSignatureRole: string, baUnitId: string): Observable<Source> {
        const sourceId = source.id;
        const formdata = `{"sourceId": "${sourceId}","baUnitId": "${baUnitId}","electronicSignatureRole": "${electronicSignatureRole}"}`;

        return this.http
            .post(`${this.apiUrl}/pdfsigner/files`, formdata)
            .pipe(map(ModelFactory.manageSourcePolymorphism), catchError(this.handleError));
    }

    getSourcesByIds(ids: string[]): Observable<Source[]> {
        return this.http.post<Source[]>(`${this.requestUrl}/sources/ids`, ids).pipe(
            map((response) => response.map(ModelFactory.manageSourcePolymorphism)),
            catchError(this.handleError),
        );
    }

    getSourceByID(sourceId): Observable<Source> {
        return this.http.get<Source>(`${this.requestUrl}/sources/${sourceId}`).pipe(
            map((response) => new Source(response)),
            catchError(this.handleError),
        );
    }

    getSource(source: Source): Observable<Source> {
        return this.http
            .get<Source>(`${this.requestUrl}/sources/${source.id}`)
            .pipe(map(ModelFactory.manageSourcePolymorphism), catchError(this.handleError));
    }

    getTitleSource(baUnitId): Observable<Source> {
        return this.http
            .get<Source>(`${this.requestUrl}/sources/ba-unit/${baUnitId}`)
            .pipe(map(ModelFactory.manageSourcePolymorphism), catchError(this.handleError));
    }

    updateSource(source: Source): Observable<Source> {
        return this.http
            .put<Source>(`${this.requestUrl}/sources/${source.id}`, source)
            .pipe(map(ModelFactory.manageSourcePolymorphism), catchError(this.handleError));
    }

    saveSourceFile(uploadSource: UploadSource): Observable<ExtArchive> {
        const formdata = new FormData();
        formdata.set('file', uploadSource.file);
        formdata.set('folderName', uploadSource.folderName);
        return this.http.post<ExtArchive>(`${this.apiUrl}/documents/upload-files`, formdata).pipe(
            map((response) => new ExtArchive(response)),
            catchError(this.handleError),
        );
    }

    createSource(extArchive: any, source: Source): Observable<Source> {
        source.extArchive = extArchive;
        return this.http
            .post<Source>(`${this.requestUrl}/sources`, source)
            .pipe(map(ModelFactory.manageSourcePolymorphism), catchError(this.handleError));
    }

    addUpdateMLAdminstrativeSource(source: Source): Observable<Source> {
        return this.http
            .post<Source>(`${this.requestUrl}/sources`, source)
            .pipe(map(ModelFactory.manageSourcePolymorphism), catchError(this.handleError));
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }
}

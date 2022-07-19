import { throwError as observableThrowError, Observable } from 'rxjs';
import { CodeList } from '@app/core/models/codeList.model';
import { Injectable } from '@angular/core';
import { environment as config } from 'environments/environment';
import { CodeListType, CodeListTypeEnum } from '@app/core/models/codeListType.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import { UtilService } from '@app/core/utils/util.service';
import { SelectItem } from 'primeng/api';

@Injectable()
export class CodeListService {
    private endpointUrl = `${config.api}/v1`;

    constructor(private http: HttpClient, private utilService: UtilService) {}

    getCodeListTypes(args: any = {}): Observable<CodeListType[]> {
        return this.http.get<CodeListTypeEnum[]>(`${this.endpointUrl}/code-lists/types`).pipe(
            map((response) => response.map((clt) => new CodeListType(clt))),
            catchError(this.handleError),
        );
    }

    getCodeList(codeListId: string): Observable<CodeList> {
        return this.http.get<CodeList>(`${this.endpointUrl}/code-lists/${codeListId}`).pipe(
            map((response) => new CodeList(response)),
            catchError(this.handleError),
        );
    }

    updateCodeList(codeList: CodeList): Observable<CodeList> {
        return this.http.put<CodeList>(`${this.endpointUrl}/code-lists/${codeList.codeListID}`, codeList).pipe(
            map((response) => new CodeList(response)),
            catchError(this.handleError),
        );
    }

    createCodeList(codeList: CodeList): Observable<CodeList> {
        codeList.codeListID = '1';
        return this.http.post<CodeList>(`${this.endpointUrl}/code-lists`, codeList).pipe(
            map((response) => new CodeList(response)),
            catchError(this.handleError),
        );
    }
    getCodeLists(args: any = {}): Observable<CodeList[]> {
        const query = {};
        if (args.search) {
            _.extend(query, { search: args.search });
        }
        if (args.type) {
            _.extend(query, { type: args.type });
        }

        if (args.searchNotContaining) {
            _.extend(query, { searchNotContaining: args.searchNotContaining });
        }

        return this.http
            .get<CodeList[]>(`${this.endpointUrl}/code-lists`, { params: new HttpParams({ fromObject: query }) })
            .pipe(
                map((response) => response.map((clt) => new CodeList(clt))),
                catchError(this.handleError),
            );
    }

    getCodeListsTranslated(args: any = {}): Observable<CodeList[]> {
        return this.getCodeLists(args).pipe(
            map((response) => response.map((r) => this.utilService.translateCodeList(r))),
            catchError(this.handleError),
        );
    }

    /**
     * Load the options for select, checkbox and radios fields
     *
     * @param searchValue The array of codelist options values
     */
    loadCodeListOptions(searchValue: string): Observable<SelectItem[]> {
        return this.utilService.mapToSelectItems(
            this.getCodeLists({ type: searchValue }),
            'CODELIST.VALUES',
            'value.value',
            'COMMON.ACTIONS.SELECT',
        );
    }

    loadCodeListOptionsArray(searchValues: string[]): Observable<SelectItem[]>[] {
        return searchValues.map((_searchValue) => this.loadCodeListOptions(_searchValue));
    }

    deleteCodeList(codeListId: string): any {
        return this.http.delete(`${this.endpointUrl}/code-lists/${codeListId}`).subscribe(
            () => {},
            (error) => this.handleError(error),
        ); // TODO: this should be done on the component
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }
}

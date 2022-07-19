import { throwError as observableThrowError, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as config } from 'environments/environment';
import { map, catchError } from 'rxjs/operators';
import { Form } from '@app/core/models/form.model';
import { FormType } from '@app/core/models/form-type.model';
import { withCache } from '@ngneat/cashew';

@Injectable()
export class FormService {
    private endpointUrl = `${config.api}/v1`;

    constructor(private http: HttpClient) {}

    /**
     * Get all the existing forms
     */
    getForms(): Observable<Form[]> {
        return this.http.get<Form[]>(`${this.endpointUrl}/forms`, withCache()).pipe(
            map((response: Form[]) => response.map((form) => new Form(form))),
            catchError(this.handleError),
        );
    }

    /**
     * Search several forms by ids
     *
     * @param ids A comma separeted list of form ids
     */
    getFormsByIds(ids: string): Observable<Form[]> {
        return this.http.post<Form[]>(`${this.endpointUrl}/forms`, this.searchByIds(ids)).pipe(
            map((response: Form[]) => response.map((form) => new Form(form))),
            catchError(this.handleError),
        );
    }

    /**
     * Search several forms by name
     *
     * @param names A comma separeted list of form names
     */
    getFormsByNames(names: string): Observable<Form[]> {
        return this.http.post<Form[]>(`${this.endpointUrl}/forms`, this.searchByNames(names)).pipe(
            map((response: Form[]) => response.map((form) => new Form(form))),
            catchError(this.handleError),
        );
    }

    /**
     * Get a Form by Id
     *
     * @param id The Id of the form to get
     */
    getForm(id: string): Observable<Form> {
        return this.http.get(`${this.endpointUrl}/forms/${id}`, withCache()).pipe(
            map((response) => new Form(response)),
            catchError(this.handleError),
        );
    }

    /**
     * Get a Form by name
     *
     * @param name The name of the form to get
     */
    getFormByName(name: string): Observable<Form> {
        return this.http.get(`${this.endpointUrl}/forms/fileName/${name}`, withCache()).pipe(
            map((r) => new Form(r)),
            catchError(this.handleError),
        );
    }

    /**
     * Get a Form by name
     *
     * @param name The name of the form to get
     */
    getFormByDbName(name: string): Observable<Form> {
        return this.http.get(`${this.endpointUrl}/forms/name/${name}`, withCache()).pipe(
            map((r) => new Form(r)),
            catchError(this.handleError),
        );
    }

    /**
     * Update a form
     *
     * @param form The form to update
     */
    updateForm(form: Form): Observable<Form> {
        return this.http.put(`${this.endpointUrl}/form/${form.id}`, form).pipe(
            map((response) => new Form(response)),
            catchError(this.handleError),
        );
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }

    /**
     * Generates the JSON body request to make a search by name
     *
     * @param names A comma separeted list of form names
     */
    private searchByNames(names: string): string {
        return `{"formsNames":"${names}"}`;
    }

    /**
     * Generates the JSON body request to make a search by name
     *
     * @param ids A comma separeted list of form ids
     */
    private searchByIds(ids: string): string {
        return `{"formsIds":"${ids}"}`;
    }

    getFormsByType(type: FormType): Observable<Form[]> {
        return this.http.get(this.endpointUrl + '/forms', { params: new HttpParams().set('formType', type) }).pipe(
            map((response: any[]) => response.map((form: Form) => new Form(form))),
            catchError(this.handleError),
        );
    }

    saveForm(form: Form) {
        return this.http.put(this.endpointUrl + '/forms/' + form.id, form).pipe(
            map((response: any) => response),
            catchError(this.handleError),
        );
    }

    createForm(form: Form) {
        return this.http.post(this.endpointUrl + '/forms', form).pipe(
            map((response: any) => response),
            catchError(this.handleError),
        );
    }

    deleteForm(form: Form) {
        return this.http.delete(this.endpointUrl + '/forms/' + form.id).pipe(
            map((response: any) => response),
            catchError(this.handleError),
        );
    }
}

import { throwError as observableThrowError, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment as config } from 'environments/environment';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Transaction } from '@app/core/models/transaction.model';

@Injectable()
export class TransactionService {
    private endpointUrl = `${config.api}/v1`;

    constructor(private http: HttpClient) {}

    getTransactions(): Observable<Transaction[]> {
        return this.http.get<Transaction[]>(`${this.endpointUrl}/transactions`).pipe(
            map((response) => response.map((t) => new Transaction(t))),
            catchError(this.handleError),
        );
    }

    getTransaction(id: string): Observable<Transaction> {
        return this.http.get<Transaction>(`${this.endpointUrl}/transactions/${id}`).pipe(
            map((response) => new Transaction(response)),
            catchError(this.handleError),
        );
    }

    getTransactionsById(ids: string[]): Observable<Transaction[]> {
        return this.http.post<Transaction[]>(`${this.endpointUrl}/transactions/ids`, ids).pipe(
            map((response) => response.map((t) => new Transaction(t))),
            catchError(this.handleError),
        );
    }

    addTransaction(transaction: Transaction): Observable<any> {
        return this.http.post(`${this.endpointUrl}/transactions`, transaction).pipe(catchError(this.handleError));
    }

    updateTransaction(transaction: Transaction): Observable<any> {
        return this.http
            .put(`${this.endpointUrl}/transactions/${transaction.id}`, transaction)
            .pipe(catchError(this.handleError));
    }

    deleteTransaction(transaction: Transaction): Observable<any> {
        return this.http
            .delete(`${this.endpointUrl}/transactions/${transaction.id}`)
            .pipe(catchError(this.handleError));
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }
}

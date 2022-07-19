import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const fileToBase64 = (file): Observable<string> =>
    new Observable((subscriber) => {
        const reader = new FileReader();
        reader.onload = ((readerEvt) => subscriber.next(btoa(readerEvt.target.result))).bind(this);
        reader.readAsBinaryString(file);
    });

export const generateUrlFromBase64 = (base64: string): string => `data:image/jpg;base64, ${base64}`;

export const fileToBase64Url = (file): Observable<string> =>
    fileToBase64(file).pipe(map((base64) => generateUrlFromBase64(base64)));

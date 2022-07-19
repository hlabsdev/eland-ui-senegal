import { HttpErrorResponse } from '@angular/common/http';
import { MessageException } from './messageException.model';
export interface FoncierApiHttpErrorResponse extends HttpErrorResponse {
    readonly error: {
        messageexception: MessageException;
    };
}

import { StackTrace } from './stackTrace.model';
import { Response } from './response.model';

export interface MessageException {
    cause?: any;
    stackTrace: StackTrace[];
    status: string;
    timestamp: string;
    message: string;
    json: string;
    debugMessage?: any;
    subErrors?: any;
    response: Response;
    customMessage: string;
    localizedMessage: string;
    suppressed: any[];
}

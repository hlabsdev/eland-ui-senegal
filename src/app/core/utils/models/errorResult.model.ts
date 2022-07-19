export class ErrorResult {
    message: string;
    params: any;

    constructor(message: string, params?: any) {
        this.message = message;
        this.params = params;
    }

    toMessage(): any {
        return { type: 'error', text: this.message, params: this.params };
    }
}

export class WarningResult {
    message: string;
    params: any;

    constructor(message: string, params?: any) {
        this.message = message;
        this.params = params;
    }

    toMessage(): any {
        return { type: 'warning', text: this.message, params: this.params };
    }
}

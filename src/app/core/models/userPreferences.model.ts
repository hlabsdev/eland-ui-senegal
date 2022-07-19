export class UserPreferences {
    username: string;
    language: string;

    constructor(obj: any = {}) {
        this.username = obj.username;
        this.language = obj.language;
    }
}

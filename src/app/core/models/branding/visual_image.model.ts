import { ApplicationPreferences } from '@app/core/models/application.preferences.model';

export class VisualImage {
    id: number;
    image: string;
    type: string;
    url: string;
    settings: ApplicationPreferences;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.image = obj.image;
        this.type = obj.type;
        this.url = obj.url;
        this.settings = obj.settings;
    }
}

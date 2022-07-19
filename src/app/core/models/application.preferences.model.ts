import { Quicklink } from '@app/features/quicklink/models/quicklink.model';

export class ApplicationPreferences {
    organization_name: string;
    organization_website: string;
    organization_main_color: string;
    organization_visual_identity: string;
    homepage_visuals: string[];
    save_quicklinks: boolean;
    quicklinks?: Quicklink[];

    constructor(obj: any = {}) {
        this.organization_name = obj.organization_name;
        this.organization_website = obj.organization_website;
        this.organization_main_color = obj.organization_main_color;
        this.organization_visual_identity = obj.organization_visual_identity;
        this.homepage_visuals = obj.homepage_visuals;
        this.save_quicklinks = obj.save_quicklinks;
        this.quicklinks = obj.quicklinks;
    }
}

import { HslaBrand } from '@app/core/models/branding/hsla-brand';
import { QuicklinksGroup } from '@features/quicklink/models/quicklink.model';
import { VisualImage } from '@app/core/models/branding/visual_image.model';
export class ApplicationPreferences {
    id: string;
    organizationName: string;
    organizationWebsite: string;
    sliderVisuals: VisualImage[];
    saveQuicklinksValue: boolean;
    quicklinksGroups: QuicklinksGroup[];
    organizationMainColor: HslaBrand;
    appMyTasksButtonColor: HslaBrand;
    appClaimsButtonColor: HslaBrand;
    appAllTasksButtonColor: HslaBrand;
    organizationVisualIdentity: string;
    appSliderVisual_1: string;
    appSliderVisual_2: string;
    appSliderVisual_3: string;
    main: boolean;
    isActive: boolean;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.organizationName = obj.organizationName;
        this.organizationWebsite = obj.organizationWebsite;
        this.sliderVisuals = obj.sliderVisuals;
        this.saveQuicklinksValue = obj.saveQuicklinksValue;
        this.quicklinksGroups = obj.quicklinksGroups;
        this.organizationMainColor = obj.organizationMainColor;
        this.appMyTasksButtonColor = obj.appMyTasksButtonColor;
        this.appClaimsButtonColor = obj.appClaimsButtonColor;
        this.appAllTasksButtonColor = obj.appAllTasksButtonColor;
        this.organizationVisualIdentity = obj.organizationVisualIdentity;
        this.appSliderVisual_1 = obj.appSliderVisual_1;
        this.appSliderVisual_2 = obj.appSliderVisual_2;
        this.appSliderVisual_3 = obj.appSliderVisual_3;
        this.main = obj.main;
        this.isActive = obj.isActive;
    }
}

import { Act } from './act.model';

export class RegisterAct {
    id: string;
    act: Act;
    registrationDate: Date;
    registrationNumber: number;
    registrationVolume: number;
    registrationFolio: number;
    baUnitId: string;
    baUnitVersion: number;

    constructor(rda: any = {}) {
        this.id = rda.id;
        this.act = rda.act ? new Act(rda.act) : null;
        this.registrationDate = rda.registrationDate ? new Date(rda.registrationDate) : null;
        this.registrationNumber = rda.registrationNumber;
        this.registrationVolume = rda.registrationVolume;
        this.registrationFolio = rda.registrationFolio;
        this.baUnitId = rda.baUnitId;
        this.baUnitVersion = rda.baUnitVersion;
    }
}

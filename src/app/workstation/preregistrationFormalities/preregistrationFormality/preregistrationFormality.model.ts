import { Application } from '@app/core/models/application.model';
import { Rdai } from '@app/core/models/rdai.model';
import Utils from '@app/core/utils/utils';
import { BAUnit } from '../../baUnit/baUnit.model';
import { Parcel } from '../../spatialUnit/parcel/parcel.model';

export class PreregistrationFormality {
    id: string;

    // 1. Dépôt des réquisitions
    registerDepositDate: Date;
    applicant: string;
    owner: string;
    descriptionImmovable: string;
    valueImmovable: string;
    natureImmovable: string;
    capacityImmovable: string;
    villagePlaceStreet: string;
    circleCommune: string;

    // 2. Dépôt des pièces jointes
    thirdPartySummationDate: Date;
    numberOfAttachments: number;
    thirdPartyDepositDate: Date;

    // 3. Mentions inscrites au registre des oppositions
    registryDateOR: Date;
    registryNumberOR: number;
    registryDatePR: Date;
    registryNumberPR: number;

    // 4. Procedure judiciaire
    firstInstanceJudgmentDate: Date;
    firstInstanceDeliveryDate: Date;
    firstInstanceAppealDate: Date;
    onAppealJudgmentDate: Date;
    onAppealDeliveryDate: Date;
    onAppealAppealDate: Date;
    onCassationJudgmentDate: Date;
    onCassationDeliveryDate: Date;

    // 5. Publications des demandes
    transmissionDateION: Date;
    insertionDateION: Date;
    transmissionDateCH: Date;
    postingDateCH: Date;
    normalDate: Date;
    propagationAbsence: string;
    sendingDatePB: Date;
    acknowledgmentReceiptDatePB: Date;
    sendingDateIN: Date;
    acknowledgmentReceiptReturnDateIN: Date;

    // 6. Bornage
    inclusionOfficialJournalDate: Date;
    individualNoticesDate: Date;
    executionVerbalProcessDate: Date;
    executionBoundaryDelimitationDate: Date;

    // 7. Immatriculation des immeubles
    depositsRegisterInscriptionDate: Date;
    depositsRegisterFolioCase: string;
    depositsRegisterTitleCopiesNumber: number;
    titlesRegisteredLandRegister: string;
    titlesRegisteredLandRegisterNumber: string;
    titlesRegisteredCertifsNumber: Date;

    // 8. baUnit
    baUnitId: string;
    baUnitVersion: number;

    constructor(obj: any = {}) {
        Object.assign(this, obj);
        this.registerDepositDate = Utils.setDate(obj.registerDepositDate);
        this.thirdPartySummationDate = Utils.setDate(obj.thirdPartySummationDate);
        this.thirdPartyDepositDate = Utils.setDate(obj.thirdPartyDepositDate);
        this.registryDateOR = Utils.setDate(obj.registryDateOR);
        this.registryDatePR = Utils.setDate(obj.registryDatePR);
        this.firstInstanceJudgmentDate = Utils.setDate(obj.firstInstanceJudgmentDate);
        this.firstInstanceDeliveryDate = Utils.setDate(obj.firstInstanceDeliveryDate);
        this.firstInstanceAppealDate = Utils.setDate(obj.firstInstanceAppealDate);
        this.onAppealJudgmentDate = Utils.setDate(obj.onAppealJudgmentDate);
        this.onAppealDeliveryDate = Utils.setDate(obj.onAppealDeliveryDate);
        this.onAppealAppealDate = Utils.setDate(obj.onAppealAppealDate);
        this.onCassationJudgmentDate = Utils.setDate(obj.onCassationJudgmentDate);
        this.onCassationDeliveryDate = Utils.setDate(obj.onCassationDeliveryDate);
        this.transmissionDateION = Utils.setDate(obj.transmissionDateION);
        this.insertionDateION = Utils.setDate(obj.insertionDateION);
        this.transmissionDateCH = Utils.setDate(obj.transmissionDateCH);
        this.postingDateCH = Utils.setDate(obj.postingDateCH);
        this.normalDate = Utils.setDate(obj.normalDate);
        this.sendingDatePB = Utils.setDate(obj.sendingDatePB);
        this.acknowledgmentReceiptDatePB = Utils.setDate(obj.acknowledgmentReceiptDatePB);
        this.sendingDateIN = Utils.setDate(obj.sendingDateIN);
        this.acknowledgmentReceiptReturnDateIN = Utils.setDate(obj.acknowledgmentReceiptReturnDateIN);
        this.inclusionOfficialJournalDate = Utils.setDate(obj.inclusionOfficialJournalDate);
        this.individualNoticesDate = Utils.setDate(obj.individualNoticesDate);
        this.executionBoundaryDelimitationDate = Utils.setDate(obj.executionBoundaryDelimitationDate);
        this.executionVerbalProcessDate = Utils.setDate(obj.executionVerbalProcessDate);
        this.depositsRegisterInscriptionDate = Utils.setDate(obj.depositsRegisterInscriptionDate);
        this.baUnitId = obj.baUnitId;
        this.baUnitVersion = obj.baUnitVersion;
    }

    public assignPrePopulatedData(baUnit: BAUnit, rdai: Rdai, application: Application): PreregistrationFormality {
        this.assignBaUnitInfo(baUnit);
        this.assignRdaiInfo(rdai);
        this.assingApplication(application);
        return this;
    }

    public assignBaUnitInfo(baUnit: BAUnit): PreregistrationFormality {
        if (!baUnit) {
            return this;
        }

        const mainParcel = baUnit.getPrincipalParcel() || ({} as Parcel);

        this.owner = baUnit
            .getPartyOwners()
            .map((p) => p.getName())
            .join(', ');
        this.capacityImmovable = mainParcel.areaRepresentation;
        this.descriptionImmovable = mainParcel.parcelDescription;
        this.natureImmovable = mainParcel.nature.description;

        this.villagePlaceStreet = (mainParcel.district && mainParcel.district.name) || mainParcel.location;
        this.circleCommune = mainParcel.district && mainParcel.district.division.circle.name;

        this.titlesRegisteredLandRegister = baUnit?.registryRecord?.registry?.name;
        this.titlesRegisteredLandRegisterNumber = baUnit.getTitle();
        this.depositsRegisterFolioCase = `${baUnit?.registryRecord?.folio} - ${baUnit?.registryRecord?.volume}`;
        this.depositsRegisterTitleCopiesNumber = baUnit.copiesNumber;
        this.baUnitId = baUnit.uid;
        this.baUnitVersion = baUnit.version;

        return this;
    }

    public assignRdaiInfo(rdai: Rdai): PreregistrationFormality {
        if (!rdai) {
            return this;
        }
        this.depositsRegisterInscriptionDate = Utils.setDate(rdai.depositDate);
        return this;
    }

    public assingApplication(application: Application): PreregistrationFormality {
        if (!application) {
            return this;
        }
        this.applicant = application.applicant.displayName;
        return this;
    }
}

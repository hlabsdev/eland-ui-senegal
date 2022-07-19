import { Serializable } from '@app/core/interfaces/serializable.interface';
import { ResponsibleOffice } from '@app/core/models/responsibleOffice.model';
import { VersionedObject } from '@app/core/models/versionedObject.model';
import Utils from '@app/core/utils/utils';
import * as _ from 'lodash';
import { CodeList } from '@app/core/models/codeList.model';
import { ComplementaryInfo } from '@app/core/models/complementaryInfo.model';
import { Party } from '@app/core/models/party.model';
import { Source } from '@app/core/models/source.model';
import { RegistryRecord } from '@app/core/models/registryRecord.model';
import { Variables } from '@app/core/models/variables.model';
import { Restriction } from '../rrr/restriction/restriction.model';
import { RRR } from '../rrr/rrr/rrr.model';
import { Parcel } from '../spatialUnit/parcel/parcel.model';
import { SpatialUnit } from '../spatialUnit/spatialUnit.model';
import { ModelFactory } from '@app/core/utils/model.factory';

export class BAUnit extends VersionedObject implements Serializable {
    uid: string;
    version: number;
    name: string;
    type: CodeList;
    rrrs: RRR[];
    spatialUnits: SpatialUnit[];
    parties: Party[];
    registryRecord: RegistryRecord;
    sources: Source[];
    owner: string;
    titleName: string;
    complementaryInfo: ComplementaryInfo;
    slipNumber: number;
    creationMode: CodeList;
    creationDate: Date;
    issueDate: Date;
    copiesNumber: number;
    duplicatesNumber: number;
    titleReference: string;
    modUser: string;
    modDate: Date;
    isAdministrator: boolean;
    responsibleOffice: ResponsibleOffice;
    registrationDate: Date;
    registered: boolean;
    sigtasPropertyNo: number;
    sigtasAssessmentDocumentNo: string;
    sigtasPaymentTransactionId: string;

    constructor(obj: any = {}, skip: any = {}) {
        super(obj);
        this.uid = obj.uid;
        this.version = obj.version;
        this.name = obj.name;
        this.type = obj.type;
        this.rrrs = obj.rrrs ? obj.rrrs.map((rrr) => ModelFactory.manageRRRPolymorphism(rrr)) : [];
        this.parties = obj.parties ? obj.parties.map((p) => ModelFactory.managePartyPolymorphism(p)) : [];
        this.spatialUnits =
            obj.spatialUnits && !skip.spatialUnits
                ? obj.spatialUnits.map((su) => ModelFactory.manageSpatialUnitPolymorphism(su))
                : [];
        this.registryRecord = obj.registryRecord ? new RegistryRecord(obj.registryRecord) : new RegistryRecord();
        this.sources = obj.sources ? obj.sources.map((source) => ModelFactory.manageSourcePolymorphism(source)) : [];
        this.owner = obj.owner;
        this.titleName = this.getTitle();
        this.complementaryInfo = obj.complementaryInfo ? new ComplementaryInfo(obj.complementaryInfo) : null;
        this.slipNumber = obj.slipNumber ? obj.slipNumber : 0;
        this.creationMode = obj.creationMode;
        this.creationDate = Utils.setDate(obj.creationDate);
        this.issueDate = Utils.setDate(obj.issueDate);
        this.copiesNumber = obj.copiesNumber ? obj.copiesNumber : 1;
        this.duplicatesNumber = obj.duplicatesNumber ? obj.duplicatesNumber : 0;
        this.titleReference = obj.titleReference;
        this.modDate = Utils.setDate(obj.modDate);
        this.modUser = obj.modUser;
        this.responsibleOffice = new ResponsibleOffice(obj.responsibleOffice || {});
        this.isAdministrator = obj.isAdministrator;
        this.registrationDate = Utils.setDate(obj.registrationDate);
        this.registered = obj.registered ? obj.registered : false;
        this.sigtasPropertyNo = obj.sigtasPropertyNo;
        this.sigtasAssessmentDocumentNo = obj.sigtasAssessmentDocumentNo;
        this.sigtasPaymentTransactionId = obj.sigtasPaymentTransactionId;
    }

    public serialize(): Variables {
        return {
            party: {
                value: JSON.stringify(this),
                type: 'Json',
            },
        };
    }

    public serializeWithoutId(): Variables {
        return {
            party: {
                value: JSON.stringify(_.set(_.cloneDeep(this), 'uid', null)),
                type: 'Json',
            },
        };
    }

    getTitle() {
        if (this.registryRecord && this.registryRecord.registry && this.registryRecord.titleId) {
            return `${this.registryRecord.titleId}/${this.registryRecord.registry.code}`;
        }
        return '';
    }

    getGetBook() {
        if (this.registryRecord && this.registryRecord.registry) {
            return `${this.registryRecord.folio} - ${this.registryRecord.registry.name}`;
        }
    }

    isBaUnitSet() {
        return !_.isEmpty(this.registryRecord.registry);
    }

    hasParties() {
        if (_.isEmpty(this.parties)) {
            return false;
        }

        if (this.parties.length === 1) {
            return this.hasPartyOwner();
        }

        return this.hasPartyOwner();
    }

    hasPartyOwner() {
        return !_.isEmpty(
            this.parties.find(
                (item) =>
                    (item.radiationDate === null && item.partyRoleType.value === 'PARTY_ROLE_OWNER') ||
                    item.partyRoleType.value === 'PARTY_ROLE_PRINCIPAL_OWNER',
            ),
        );
    }

    getPartyOwners(): Party[] {
        return this.parties.filter(
            (item) =>
                (item.radiationDate === null && item.partyRoleType.value === 'PARTY_ROLE_OWNER') ||
                item.partyRoleType.value === 'PARTY_ROLE_PRINCIPAL_OWNER',
        );
    }

    getParcels(): Parcel[] {
        return this.spatialUnits.filter((item) => item.spatialUnitType === 'PARCEL').map((p) => p as Parcel);
    }

    hasPrincipalParcel() {
        return !_.isEmpty(this.getPrincipalParcel());
    }

    getPrincipalParcel(): Parcel {
        const pp = this.spatialUnits.find((item) => item.spatialUnitType === 'PARCEL' && item.mainParcel === true);

        return pp && (pp as Parcel);
    }

    getSubParcels(): Parcel[] {
        const pps = _.filter(
            this.spatialUnits,
            (item) =>
                item.spatialUnitType === 'PARCEL' && item.mainParcel === false && !!item.parent && !item.radiationDate,
        );
        return pps && (pps as Parcel[]);
    }

    getNotMainParcel(): Parcel {
        const pp = this.spatialUnits.find(
            (item) => item.spatialUnitType === 'PARCEL' && item.mainParcel !== true && item.radiationDate === null,
        );
        return pp && (pp as Parcel);
    }

    getNature(): string {
        const pp = this.getPrincipalParcel();
        return pp && pp.nature.value;
    }

    hasABuilding(): boolean {
        const pp = this.getPrincipalParcel();
        return pp && (pp.buildingOnParcel || pp.buildingAsPartOfParcel);
    }

    hasCaveats() {
        return this.rrrs
            ? !_.isEmpty(
                  this.rrrs
                      .filter((item) => item instanceof Restriction)
                      .map((item) => item as Restriction)
                      .filter((item) => item.isCaveat()),
              )
            : false;
    }

    nextSlipNumber() {
        return this.slipNumber + 1;
    }

    currentSurface() {
        if (this.hasPrincipalParcel()) {
            const mainParcel = this.getPrincipalParcel();
            return Utils.getAreaRepresentation(mainParcel.area.areaSize, mainParcel.area.measureUnit.value);
        } else {
            return '00ha00a00ca';
        }
    }

    cleanSpatialUnits = () => {
        this.spatialUnits = this.spatialUnits.map((su) => new SpatialUnit(su.getCleanVersion()));
        return this;
    };

    setSpatialUnits = (spatialUnits: (SpatialUnit | Parcel)[], asNew = true) => {
        const newSpatialUnits = spatialUnits.map((su) =>
            su.spatialUnitType === 'PARCEL' ? new Parcel(su) : new SpatialUnit(su),
        );
        this.spatialUnits = _.uniqBy(asNew ? newSpatialUnits : [...this.spatialUnits, ...newSpatialUnits], 'suid');
        return this;
    };

    cloneBasicInfos(creationMode: CodeList, setTitleNumber = false): BAUnit {
        const newBaUnit = _.clone(this);
        newBaUnit.rrrs = [];
        newBaUnit.parties = [];
        newBaUnit.sources = [];
        newBaUnit.spatialUnits = [];
        newBaUnit.beginLifespanVersion = null;
        newBaUnit.endLifespanVersion = null;
        newBaUnit.complementaryInfo = null;
        newBaUnit.registered = false;
        newBaUnit.uid = null;
        newBaUnit.slipNumber = 0;
        newBaUnit.copiesNumber = 1;
        newBaUnit.titleName = newBaUnit.getTitle();
        newBaUnit.registryRecord = newBaUnit.registryRecord.cloneWithOldPreset();
        newBaUnit.creationMode = creationMode;
        newBaUnit.creationDate = new Date();
        newBaUnit.issueDate = new Date();
        newBaUnit.titleReference = setTitleNumber ? this.getTitle() : null;
        return newBaUnit;
    }

    setNewRegistryPreset(newRegistryRecord: RegistryRecord): BAUnit {
        this.registryRecord.setNewPreset(newRegistryRecord);
        this.titleName = this.getTitle();
        return this;
    }
}

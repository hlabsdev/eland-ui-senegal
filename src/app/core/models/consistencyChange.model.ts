import { BAUnit } from '@app/workstation/baUnit/baUnit.model';
import { Parcel } from '@app/workstation/spatialUnit/parcel/parcel.model';
import * as _ from 'lodash';
import { SelectItem } from 'primeng/api';
import { DragPanelItem } from '@app/core/layout/elements/drag-panels/drag-panels/dragPanelItem.template';
import { CodeListService } from '@app/core/services/codeList.service';
import { CodeListTypeEnum, CodeListTypes } from '@app/core/models/codeListType.model';
import * as functions from '@app/core/utils/validations/functions/index';
import { val } from '@app/core/utils/validations/main';

/* eslint-disable */
export class ConsistencyChangeType {
  static SOURCE = new ConsistencyChangeType('SOURCE');
  static DESTINATION = new ConsistencyChangeType('DESTINATION');
  value: ConsistencyChangeTypeEnum;

  constructor(value: ConsistencyChangeTypeEnum | ConsistencyChangeType) {
    this.value = <ConsistencyChangeTypeEnum>(typeof value === typeof ConsistencyChangeType
      ? (<ConsistencyChangeType>value).value : value);
  }

  getSelectItem(): SelectItem {
    return {
      label: this.value,
      value: this
    };
  }

  isEqual(cct: ConsistencyChangeType) {
    return this.value === cct.value;
  }
}

export type ConsistencyChangeTypeEnum = 'SOURCE' | 'DESTINATION';


export class ConsistencyChange {

  id: string;
  baUnit: BAUnit;
  parcel: Parcel;

  baUnitId: string;
  baUnitVersion: number;
  parcelSuid: string;
  parcelVersion: number;
  type: ConsistencyChangeType | any;
  groupId: string;
  group: Partial<ConsistencyChangeGroup>;

  constructor(obj: Partial<ConsistencyChange> = {}, createParent = true, setParent = true, parent?: Partial<ConsistencyChangeGroup>) {
    const currentGroup = parent || obj.group ? _.clone(parent || obj.group) : null;
    this.id = obj.id;
    this.baUnit = obj.baUnit ? new BAUnit(obj.baUnit) : null;
    this.parcel = obj.parcel;
    this.baUnitId = obj.baUnitId || (obj.baUnit && obj.baUnit.uid);
    this.baUnitVersion = obj.baUnitVersion || (obj.baUnit && obj.baUnit.version);
    this.parcelSuid = obj.parcelSuid || (obj.parcel && obj.parcel.suid);
    this.parcelVersion = obj.parcelVersion || (obj.parcel && obj.parcel.version);
    this.type = obj.type && (obj.type.value ? obj.type : new ConsistencyChangeType(obj.type));
    this.groupId = currentGroup ? currentGroup.id : obj.groupId;
    this.group = setParent && currentGroup ?
      createParent ? new ConsistencyChangeGroup(currentGroup).getNoChildVersion() : currentGroup.getNoChildVersion()
      : null;
  }

  getCleanVersion = (): Partial<ConsistencyChange> => ({
    id: this.id, parcelSuid: this.parcelSuid, parcelVersion: this.parcelVersion,
    baUnitId: this.baUnitId, baUnitVersion: this.baUnitVersion, type: this.type.value
  })

  createFromBaUnit = (baUnit: BAUnit, type: ConsistencyChangeType): ConsistencyChange =>
    new ConsistencyChange({ parcel: baUnit.getPrincipalParcel(), baUnit, type })

  setBaUnit = (baUnit: BAUnit) => {
    this.baUnit = baUnit;
    this.baUnitId = baUnit.uid;
    this.baUnitVersion = baUnit.version;
    return this;
  }

  findAndSetBaUnit = (baUnits: BAUnit[]) => {
    this.setBaUnit(_.find(baUnits, ['uid', this.baUnitId]));
    return this;
  }


  setParcel = (parcel: Parcel) => {
    this.parcel = parcel;
    this.parcelSuid = parcel.suid;
    this.parcelVersion = parcel.version;
    return this;
  }

  isSource = (): Boolean => this.type && this.type.value === ConsistencyChangeType.SOURCE.value;
  isDestination = (): Boolean => this.type && this.type.value === ConsistencyChangeType.DESTINATION.value;
}

export class ConsistencyChangeGroup {

  static codeListService: CodeListService;
  id: string;
  action: ConsistencyChangeGroupAction | any;
  consistencyChanges: Partial<ConsistencyChange>[];
  sourceType = ConsistencyChangeType.SOURCE;
  destinationType = ConsistencyChangeType.DESTINATION;

  constructor(obj: Partial<ConsistencyChangeGroup> = {}, createChild = true) {
    this.id = obj.id;
    this.action = obj.action && (obj.action.value ? obj.action : new ConsistencyChangeGroupAction(obj.action));
    this.consistencyChanges = obj.consistencyChanges ?
      obj.consistencyChanges.map(cc => createChild ? new ConsistencyChange(cc, false, true, this) : cc) : [];
  }

  static setCodeListService = (codeListService: CodeListService) => ConsistencyChangeGroup.codeListService = codeListService;

  getPartitionType = () => this.getCodeListByName(CodeListTypes.BA_UNIT_CREATION_MODE, 'BA_UNIT_CREATION_MODE_PARTITION');

  getDivisionType = () => this.getCodeListByName(CodeListTypes.BA_UNIT_CREATION_MODE, 'BA_UNIT_CREATION_MODE_DIVISION');

  getConsistencyChanges(validation: Function, defaultValue?: Function) {
    const tmpCCs = _.filter(this.consistencyChanges, validation);
    return tmpCCs && tmpCCs.length > 0 ? tmpCCs : (defaultValue ? defaultValue() : null);
  }

  public getConsistencyChange(validation: Function, defaultValue?: Function) {
    const tmp = this.getConsistencyChanges(validation);
    return tmp ? tmp[0] : (defaultValue ? defaultValue() : null);
  }

  public getSource = (defaultValue?: Function) =>
    this.getConsistencyChange(cc => cc.isSource(), defaultValue)

  public getSourceOrCreate = (baUnit: BAUnit): Partial<ConsistencyChange> => {
    const source = this.getSource();
    return source && source.baUnit && source.baUnit.uid ?
      source.baUnit.uid === baUnit.uid ? source : source.setBaUnit(baUnit) :
      this.createConsistencyChangeFromBaUnit(baUnit, this.sourceType);
  }

  public getDestinations = (defaultValue?: Function) =>
    this.getConsistencyChanges(cc => cc.isDestination(), defaultValue)

  public getDestinationsAndMapOrCreate = (baUnits: BAUnit[]) => {
    const tmpBaUnits = baUnits;
    const destinations = this.getDestinations() || [];
    destinations.forEach(destination => {
      if (destination.baUnit && destination.baUnit.uid) {
        if (tmpBaUnits.length > 0) {
          let indexOfBaUnit = -1;
          tmpBaUnits.forEach((baunit, i) => {
            if (baunit.uid === destination.baUnit.uid) {
              indexOfBaUnit = i;
            }
          });
          if (indexOfBaUnit !== -1) {
            // remove baunit
            destination.setBaUnit(tmpBaUnits.splice(indexOfBaUnit, 1)[0]);
          } else {
            // no baunit is associated
          }
        } else {
          // baunit need to be created
        }
      }
    });
    tmpBaUnits.forEach(baUnit => {
      destinations.push(this.createConsistencyChangeFromBaUnit(baUnit, this.destinationType, true));
    });
    return destinations;
  }

  getCleanVersion = (): Partial<ConsistencyChangeGroup> =>
    ({ id: this.id, action: this.action.value, consistencyChanges: this.consistencyChanges })

  // public getDestinationsOrCreate()

  getNoChildVersion = (): Partial<ConsistencyChangeGroup> => ({ ...this.getCleanVersion(), consistencyChanges: null });

  getCleanVersionWithChildCleanVersion = (): Partial<ConsistencyChangeGroup> =>
    ({ id: this.id, action: this.action.value, consistencyChanges: this.consistencyChanges.map(cc => cc.getCleanVersion()) })

  public createConsistencyChange(obj: Partial<ConsistencyChange>): ConsistencyChange {
    const tmpCC = new ConsistencyChange(obj, false, true, this);
    this.consistencyChanges.push(tmpCC);
    return tmpCC;
  }

  public createConsistencyChangeFromBaUnit(baUnit: BAUnit, type: ConsistencyChangeType, emptyParcel: boolean = false): ConsistencyChange {
    const tmpCC = new ConsistencyChange({ baUnit, parcel: !emptyParcel ? baUnit.getPrincipalParcel() : null, type }, false, true, this);
    this.consistencyChanges.push(tmpCC);
    return tmpCC;
  }

  public isFusion() {
    return this.action.value === ConsistencyChangeGroupAction.FUSION.value;
  }

  public isPartition() {
    return this.action.value === ConsistencyChangeGroupAction.PARTITION.value;
  }

  private getCodeListByName = (type: CodeListTypeEnum, search: string) => ConsistencyChangeGroup.codeListService ?
    ConsistencyChangeGroup.codeListService.getCodeLists({ type, search })[0] : null
}

export class ConsistencyChangeGroupAction {
  static PARTITION = new ConsistencyChangeGroupAction('PARTITION');
  static FUSION = new ConsistencyChangeGroupAction('FUSION');
  value: ConsistencyChangeGroupActionEnum;

  constructor(value: ConsistencyChangeGroupActionEnum | ConsistencyChangeGroupAction) {
    this.value = typeof value === typeof ConsistencyChangeGroupAction ?
      (<ConsistencyChangeGroupAction>value).value :
      <ConsistencyChangeGroupActionEnum>value;
  }

  getSelectItem(): SelectItem {
    return {
      label: this.value,
      value: this
    };
  }

}

export type ConsistencyChangeGroupActionEnum = 'PARTITION' | 'FUSION';

export interface ConsistencyChangeDragPanelItem extends DragPanelItem<BAUnit, Parcel> {
  consistencyChange: ConsistencyChange;
}

const validationFunctions = function () {
  const validationsFns: any = {};
  validationsFns.sameBaUnitIdCCBase = base => tc => val.init<ConsistencyChange>(base, 'baUnit.id').pipe(functions.isEqualAndNotNull)(tc, 'id');
  validationsFns.sameId = base => val.init<ConsistencyChange>(base, 'id').pipe(functions.isEqualAndNotNull);
  validationsFns.isSource = base => val.init<ConsistencyChange>(base).pipe(functions.map((b, tc) => b.isSource()));
  validationsFns.isDestination = base => val.init<ConsistencyChange>(base).pipe(functions.map((b, tc) => b.isDestination()));
  return validationsFns;
}();

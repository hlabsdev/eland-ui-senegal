import { VersionedObject } from '@app/core/models/versionedObject.model';
import { Region } from '@app/core/models/territory/region.model';
import { CardinalPoint } from '@app/workstation/spatialUnit/cardinalPoint.model';
import Utils from '@app/core/utils/utils';
import { CodeList } from '@app/core/models/codeList.model';
import { ErrorResult } from '@app/core/utils/models/errorResult.model';
import { ExtAddress } from '@app/core/models/extAddress.model';
import { District } from '@app/core/models/territory/district.model';
import { Division } from '@app/core/models/territory/division.model';
import { Circle } from '@app/core/models/territory/circle.model';
import { Registry } from '@app/core/models/registry.model';
import { VolumeValue } from '@app/workstation/spatialUnit/volumeValue.model';
import { AreaValue } from '@app/workstation/spatialUnit/areaValue.model';
import { Point } from '@app/workstation/spatialUnit/point.model';
import { SpatialUnitGroup } from '@app/workstation/spatialUnit/spatialUnitGroup.model';
import { Level } from '@app/workstation/spatialUnit/level.model';
import { SpatialUnitTypeEnum } from '@app/workstation/spatialUnit/spatialUnitType.model';
import { isBoolean, isEmpty } from 'lodash';

export class SpatialUnit extends VersionedObject {
    [x: string]: any;
    suid: string;
    version: number;
    spatialUnitType: SpatialUnitTypeEnum;
    label: string;
    extAddress: ExtAddress;
    sourceTitle: string;
    destinationTitle: string;
    inscriptionDate: Date;
    radiationDate: Date;
    sigtasSubPropertyNo: number;
    volume: VolumeValue;
    surfaceRelation: CodeList;
    dimension: CodeList;
    area: AreaValue;
    referencePoint: Point;
    spatialUnitGroups: SpatialUnitGroup[];
    levels: Level[];
    parent: SpatialUnit;
    parent_parcelNumber: string;
    subSpatialUnits: SpatialUnit[];
    modUser: string;
    modDate: Date;
    price: number;
    registrationDate: Date;
    registered: boolean;
    spatialUnitNumber: string;

    // Values from subclases

    // Parcel
    cardinalPoints: CardinalPoint[] = [];
    registry: Registry;
    region: Region;
    circle: Circle;
    division: Division;
    district: District;
    parcelIsRegistered: boolean;
    mainParcel: boolean;
    buildings: SpatialUnit[] = [];
    buildingOnParcel: boolean;
    buildingAsPartOfParcel: boolean;

    constructor(obj: any = {}) {
        super(obj);
        this.suid = obj.suid;
        this.version = obj.version;
        this.spatialUnitType = obj.spatialUnitType;
        this.label = obj.label;
        this.extAddress = obj.extAddress ? new ExtAddress(obj.extAddress) : null;
        this.sourceTitle = obj.sourceTitle ? obj.sourceTitle : null;
        this.destinationTitle = obj.destinationTitle ? obj.destinationTitle : null;
        this.inscriptionDate = Utils.setDate(obj.inscriptionDate);
        this.radiationDate = Utils.setDate(obj.radiationDate);
        this.sigtasSubPropertyNo = obj.sigtasSubPropertyNo;
        this.volume = obj.volume ? new VolumeValue(obj.volume) : new VolumeValue();
        this.surfaceRelation = obj.surfaceRelation ? new CodeList(obj.surfaceRelation) : null;
        this.dimension = obj.dimension ? new CodeList(obj.dimension) : null;
        this.area = obj.area ? new AreaValue(obj.area) : new AreaValue();
        this.referencePoint = obj.referencePoint ? new Point(obj.referencePoint) : null;
        this.spatialUnitGroups = obj.spatialUnitGroups
            ? obj.spatialUnitGroups.map((group) => new SpatialUnitGroup(group))
            : [];
        this.levels = obj.levels ? obj.levels.map((level) => new Level(level)) : [];
        this.parent = obj.parent ? obj.parent : null;
        this.parent_parcelNumber = obj.parent ? obj.parent.parcelNumber : null;
        this.subSpatialUnits = obj.subSpatialUnits ? obj.subSpatialUnits : [];
        this.modDate = Utils.setDate(obj.modDate);
        this.modUser = obj.modUser;
        this.price = Utils.parseFloat(obj.price);

        // subclases fields
        this.setCardinalPoints(obj.cardinalPoints);
        this.registry = obj.registry ? new Registry(obj.registry) : null;
        this.region = obj.region ? new Region(obj.region) : null;
        this.circle = obj.circle ? new Circle(obj.circle) : null;
        this.division = obj.division ? new Division(obj.division) : null;
        this.district = obj.district ? new District(obj.district) : null;

        this.parcelIsRegistered = isBoolean(obj.parcelIsRegistered) ? obj.parcelIsRegistered : false;
        this.area = obj.area ? new AreaValue(obj.area) : new AreaValue();
        this.buildings = obj.buildings ? obj.buildings : [];
        this.buildingOnParcel = isBoolean(obj.buildingOnParcel) ? obj.buildingOnParcel : false;
        this.buildingAsPartOfParcel = isBoolean(obj.buildingAsPartOfParcel) ? obj.buildingAsPartOfParcel : false;
        this.registrationDate = Utils.setDate(obj.registrationDate);
        this.registered = obj.registered ? obj.registered : false;
        this.spatialUnitNumber = obj.spatialUnitType === 'PARCEL' ? obj.parcelNumber : obj.buildingNumber;
    }

    setCardinalPoints(points: any[]) {
        if (!isEmpty(points)) {
            points.forEach((point) => {
                if (typeof point === 'string') {
                    this.cardinalPoints.push(new CardinalPoint({ point }));
                } else {
                    this.cardinalPoints.push(new CardinalPoint(point));
                }
            });
        }
    }

    public validateAreaConsistency(spatialUnit: SpatialUnit, spatialUnits: SpatialUnit[], oldAreaHectares: number) {
        if (spatialUnit.area && spatialUnit.area.areaSize) {
            const newAreaHectares: number = Utils.convertAreaToHectares(
                Utils.parseFloat(spatialUnit.area.areaSize),
                spatialUnit.area.measureUnit.value,
            );
            const initialConsistency: number = this.getInitialConsistency(spatialUnit.parent, spatialUnits);
            if (newAreaHectares > initialConsistency) {
                return (spatialUnit.errorMessage = new ErrorResult('MESSAGES.AREA_CONSISTENCY_EXCEEDED_PARENT', {
                    parent_area: initialConsistency,
                }).toMessage());
            }

            let actualConsistency: number = this.getActualConsistency(spatialUnit.parent, spatialUnits);
            if (oldAreaHectares === 0) {
                actualConsistency = actualConsistency + newAreaHectares;
            } else {
                actualConsistency = actualConsistency + (newAreaHectares - oldAreaHectares);
            }

            if (actualConsistency > initialConsistency) {
                return (spatialUnit.errorMessage = new ErrorResult('MESSAGES.AREA_CONSISTENCY_EXCEEDED_SUBPARCELS', {
                    parent_area: initialConsistency,
                    subparcels_area: actualConsistency,
                }).toMessage());
            }
        } else {
            return (this.errorMessage = new ErrorResult('MESSAGES.MANDATORY_FIELDS_ERROR').toMessage());
        }
    }

    public getInitialConsistency(parentSpatialUnit: SpatialUnit, spatialUnits: SpatialUnit[]): number {
        const parentParcel = spatialUnits.find((item) => item.suid === parentSpatialUnit.suid);
        return Utils.convertAreaToHectares(parentParcel.area.areaSize, parentParcel.area.measureUnit.value);
    }

    public getActualConsistency(parentSpatialUnit: SpatialUnit, spatialUnits: SpatialUnit[]): number {
        let totalSubParcelSurface = 0;
        const subparcels = spatialUnits.filter(
            (item) => item.parent !== null && item.parent.suid === parentSpatialUnit.suid,
        );
        for (const subParcel of subparcels) {
            const subParcelSurface = Utils.convertAreaToHectares(
                subParcel.area.areaSize,
                subParcel.area.measureUnit.value,
            );
            totalSubParcelSurface = totalSubParcelSurface + subParcelSurface;
        }
        return totalSubParcelSurface;
    }

    public getCleanVersion(): SpatialUnit {
        this.baUnit = null;
        return this;
    }
}

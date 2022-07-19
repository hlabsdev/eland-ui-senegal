import Utils from './utils';
import { AreaMeasurementUnits } from '@app/workstation/spatialUnit/areaMeasurementUnit.model';

describe('getSurfaceRepresentation', function () {
    describe('hectares', function () {
        it('1.9999 hectares should be represented as 1ha99a99ca', function () {
            const areaRepresentation = Utils.getAreaRepresentation(1.9999, AreaMeasurementUnits.MEASURE_UNIT_HECTARE);
            expect(areaRepresentation).toEqual('1ha99a99ca');
        });
        it('1.23456 hectares should throw error', function () {
            const areaRepresentation = Utils.getAreaRepresentation(1.23456, AreaMeasurementUnits.MEASURE_UNIT_HECTARE);
            expect(areaRepresentation).toEqual('');
        });
    });
    describe('ares', function () {
        it('1.99 ares should be represented as 0ha1a99ca', function () {
            const areaRepresentation = Utils.getAreaRepresentation(1.99, AreaMeasurementUnits.MEASURE_UNIT_ARES);
            expect(areaRepresentation).toEqual('0ha1a99ca');
        });
        it('10.99 ares should be represented as 0ha1oa99ca', function () {
            const areaRepresentation = Utils.getAreaRepresentation(10.99, AreaMeasurementUnits.MEASURE_UNIT_ARES);
            expect(areaRepresentation).toEqual('0ha10a99ca');
        });
        it('1.234 ares should throw error', function () {
            const areaRepresentation = Utils.getAreaRepresentation(1.234, AreaMeasurementUnits.MEASURE_UNIT_ARES);
            expect(areaRepresentation).toEqual('');
        });
    });
    describe('centiares', function () {
        it('99 centiares should be represented as 0ha00a99ca', function () {
            const areaRepresentation = Utils.getAreaRepresentation(99, AreaMeasurementUnits.MEASURE_UNIT_CENTIARE);
            expect(areaRepresentation).toEqual('0ha00a99ca');
        });
        it('999 centiares should be represented as 0ha9a99ca', function () {
            const areaRepresentation = Utils.getAreaRepresentation(999, AreaMeasurementUnits.MEASURE_UNIT_CENTIARE);
            expect(areaRepresentation).toEqual('0ha9a99ca');
        });
        it('9999 centiares should be represented as 0ha99a99ca', function () {
            const areaRepresentation = Utils.getAreaRepresentation(9999, AreaMeasurementUnits.MEASURE_UNIT_CENTIARE);
            expect(areaRepresentation).toEqual('0ha99a99ca');
        });
        it('999999 centiares should be represented as 99ha99a99ca', function () {
            const areaRepresentation = Utils.getAreaRepresentation(999999, AreaMeasurementUnits.MEASURE_UNIT_CENTIARE);
            expect(areaRepresentation).toEqual('99ha99a99ca');
        });
        it('123678980234 centiares should be represented as 12367898ha2a34ca', function () {
            const areaRepresentation = Utils.getAreaRepresentation(
                123678980234,
                AreaMeasurementUnits.MEASURE_UNIT_CENTIARE,
            );
            expect(areaRepresentation).toEqual('12367898ha2a34ca');
        });
        it('1.2 centiares should throw error', function () {
            const areaRepresentation = Utils.getAreaRepresentation(1.2, AreaMeasurementUnits.MEASURE_UNIT_CENTIARE);
            expect(areaRepresentation).toEqual('');
        });
    });
});

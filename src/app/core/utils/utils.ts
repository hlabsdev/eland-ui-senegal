import { AreaMeasurementUnitEnum, AreaMeasurementUnits } from '@app/workstation/spatialUnit/areaMeasurementUnit.model';

import { first, split, trim } from 'lodash';
import { SelectItem } from 'primeng/api';

import { AreaUnitConvertion as AreaUnitConvertion } from './areaUnitConvertion.model';
import { HttpParams } from '@angular/common/http';

export default class Utils {
    /**
     * Structure to represent the convertion factor between two units
     */
    static areaUnitConvertions: AreaUnitConvertion[] = [
        {
            from: AreaMeasurementUnits.MEASURE_UNIT_HECTARE,
            to: AreaMeasurementUnits.MEASURE_UNIT_ARES,
            convertionFactor: 100,
        },
        {
            from: AreaMeasurementUnits.MEASURE_UNIT_HECTARE,
            to: AreaMeasurementUnits.MEASURE_UNIT_CENTIARE,
            convertionFactor: 10000,
        },
        {
            from: AreaMeasurementUnits.MEASURE_UNIT_ARES,
            to: AreaMeasurementUnits.MEASURE_UNIT_CENTIARE,
            convertionFactor: 100,
        },
        {
            from: AreaMeasurementUnits.MEASURE_UNIT_ARES,
            to: AreaMeasurementUnits.MEASURE_UNIT_HECTARE,
            convertionFactor: 0.01,
        },
        {
            from: AreaMeasurementUnits.MEASURE_UNIT_CENTIARE,
            to: AreaMeasurementUnits.MEASURE_UNIT_ARES,
            convertionFactor: 0.01,
        },
        {
            from: AreaMeasurementUnits.MEASURE_UNIT_CENTIARE,
            to: AreaMeasurementUnits.MEASURE_UNIT_HECTARE,
            convertionFactor: 0.0001,
        },
    ];

    static regexValidate = {
        // eslint-disable-next-line max-len
        email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        password: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9_!@#$%^&*\-\(\)]{8,128}$/,
        phone: /^[\d\(\)\+-]{0,15}$/,
        number: /^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/,
        int: /^\d+$/,
        // Whole number up to 12 characters
        int12: /^\d{1,12}$/,
        positiveDecimal: /^([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/,
        // Allows 12 numbers and 4 decimals.
        fourDecimals: /^(?!0\d|$)\d{1,12}(\.\d{1,4})?$/,
        // Allows 12 numbers 2 decimals.
        twoDecimals: /^(?!0\d|$)\d{1,12}(\.\d{1,2})?$/,
        yearDigitFormat: /^[0-9]+(\.[0-9]{1,2})?$/,
        languageKeyword: /^[A-Z0-9_\.]{1,50}$/,
        searchByVariable: /^-?([a-zA-Z0-9\- @]*:[a-zA-Z0-9\- //"']*)$/,
        alphanumeric: /^[a-zA-Z0-9]*$/,
    };

    static patternMessages = {
        [Utils.regexValidate.password.source]: 'MESSAGES.PASSWORD_PATTERN_ERROR',
        [Utils.regexValidate.email.source]: 'MESSAGES.EMAIL_PATTERN_ERROR',
        [Utils.regexValidate.phone.source]: 'MESSAGES.PHONE_PATTERN_ERROR',
        [Utils.regexValidate.number.source]: 'MESSAGES.NUMBER_PATTERN_ERROR',
        [Utils.regexValidate.alphanumeric.source]: 'MESSAGES.ALPHANUMERIC_PATTERN_ERROR',
        [Utils.regexValidate.int.source]: 'MESSAGES.INTEGER_ALLOWED_PATTERN_ERROR',
        [Utils.regexValidate.int12.source]: 'MESSAGES.TWELVE_INTEGER_CHARS_ALLOWED_PATTERN_ERROR',
        [Utils.regexValidate.positiveDecimal.source]: 'MESSAGES.POSITIVE_DECIMAL_PATTERN_ERROR',
        [Utils.regexValidate.fourDecimals.source]: 'MESSAGES.FOUR_DECIMAL_ALLOWED_PATTERN_ERROR',
        [Utils.regexValidate.twoDecimals.source]: 'MESSAGES.TWO_DECIMAL_ALLOWED_PATTERN_ERROR',
        [Utils.regexValidate.languageKeyword.source]: 'MESSAGES.LANGUAGE_KEYWORD_PATTERN_ERROR',
        [Utils.regexValidate.yearDigitFormat.source]: 'MESSAGES.YEAR_IN_DIGIT_PATTERN_ERROR',
        [Utils.regexValidate.searchByVariable.source]: 'MESSAGES.SEARCH_BY_VARIABLE_PATTERN_ERROR',
        [Utils.regexValidate.alphanumeric.source]: 'MESSAGES.ALPHANUMERIC_PATTERN_ERROR',
    };

    /**
     *Returns all the form keys wihtout the type. i.e. for APP-CHECKLIST.Legal, will return APP-CHECKLIST
     *
     * @param forms
     */
    static getFormKeys(forms: SelectItem[]): SelectItem[] {
        return forms.map((form) => (form.value ? first(split(form.value, '.')) : form.value));
    }

    /**
     * Converts formKeys to selectItem
     *
     * @param forms
     */
    static formsKeysToSelectItem(formKeys: string[]): SelectItem[] {
        return formKeys && formKeys.map((key) => ({ label: trim(key), value: trim(key) }));
    }

    /**
     * Converts formKeys to a form keys array wihtout the type. i.e. for APP-CHECKLIST.Legal, will return APP-CHECKLIST
     *
     * @param forms
     */
    static formsKeysStringToFormKeyArray(formKeys: string): string[] {
        return this.splitCommaOrSemiColon(formKeys).map((composedFormKey) => composedFormKey.split('.')[0]);
    }

    /**
     * Converts formKey to selectItem
     *
     * @param forms
     */
    static formsKeyToSelectItem(formKey: string): SelectItem[] {
        return this.formsKeysToSelectItem(this.splitCommaOrSemiColon(formKey));
    }

    /**
     * Makes all forms  formKey to selectItem by adding .READ_ONLY
     *
     * @param forms
     */
    static makeAllFormsReadOnly(forms: SelectItem[]): SelectItem[] {
        return forms.map((form) => {
            form.value = form.value + '.READ_ONLY';
            return form;
        });
    }

    /**
     * Splits , or ; ignoring spaces. If falsy returns []
     *
     * @param string
     */
    static splitCommaOrSemiColon(string: string): string[] {
        return string ? string.split(/[ ,;]+/g) : [];
    }

    /**
     * Returns type,ext,viewer of files.
     *
     * @param fileName
     */
    static getFileMimeType(fileName: string) {
        let ext = fileName.split('.').pop();
        const fileExt = ext;
        let type;
        let viewer;
        ext = ext && ext.toLowerCase();
        ext =
            ext && ['png', 'jpg', 'jpeg', 'gif'].includes(ext) ? 'image' : ext && ['bpmn'].includes(ext) ? 'bpmn' : ext;
        switch (ext) {
            case 'pdf':
                type = 'application/pdf';
                viewer = 'pdf';
                break;
            case 'image':
                type = `image/${fileExt}`;
                viewer = 'image';
                break;
            case 'bpmn':
                type = 'application/octet-stream';
                break;
            case 'cmmn':
                type = 'application/octet-stream';
                break;
            case 'dmn':
                type = 'application/octet-stream';
                break;
            default:
                type = null;
        }
        return {
            type,
            ext,
            viewer,
        };
    }

    /**
     * Rounds to 2 decimals.
     *
     * @param num
     */
    static roundToTwoDecimals(num) {
        return Math.round(num * 100) / 100;
    }

    /**
     * Rounds to 4 decimals
     *
     * @param num
     */
    static roundToFourDecimals(num) {
        return Math.round(num * 10000) / 10000;
    }

    /**
     * Coverts the surface units and returns a number runded to 4 decimals
     *
     * @param surface
     * @param from
     * @param to
     */
    static convertAreaValue(area: number, from: AreaMeasurementUnitEnum, to: AreaMeasurementUnitEnum): number {
        if (from === to) {
            return area;
        }

        const convertionFactor = Utils.areaUnitConvertions.find(
            (cf) => cf.from === from && cf.to === to,
        ).convertionFactor;
        return Utils.roundToFourDecimals(area * convertionFactor);
    }

    /**
     * Returns an area object decomposed in Hectares, Ares and Centiares
     *
     * @param surface
     * @param surfaceUnit
     */
    static decomposeToHectaresAresAndCentiares(
        area: number,
        areaUnit: AreaMeasurementUnitEnum,
    ): { hectares: number; ares: number; centiares: number; error?: string } {
        const result = {
            hectares: 0,
            ares: 0,
            centiares: 0,
            error: '',
        };

        const validationError = this.validateDecimalPrecision(area, areaUnit);

        if (validationError) {
            result.error = validationError;
            return result;
        }

        result.hectares = Utils.roundToFourDecimals(
            Utils.convertAreaValue(area, areaUnit, AreaMeasurementUnits.MEASURE_UNIT_HECTARE),
        );
        result.ares = Utils.roundToFourDecimals((result.hectares % 1) * 100);
        result.centiares = Utils.roundToFourDecimals((result.ares % 1) * 100);

        return result;
    }

    static getAreaValidator(areaUnit: AreaMeasurementUnitEnum) {
        if (areaUnit === AreaMeasurementUnits.MEASURE_UNIT_HECTARE) {
            return this.regexValidate.fourDecimals;
        }

        if (areaUnit === AreaMeasurementUnits.MEASURE_UNIT_ARES) {
            return this.regexValidate.twoDecimals;
        }

        if (areaUnit === AreaMeasurementUnits.MEASURE_UNIT_CENTIARE) {
            return this.regexValidate.int12;
        }
    }

    static validateDecimalPrecision(surface: number, surfaceUnit: AreaMeasurementUnitEnum): string {
        if (surfaceUnit === AreaMeasurementUnits.MEASURE_UNIT_HECTARE) {
            const valid = this.regexValidate.fourDecimals.test(surface.toString());
            return !valid && 'MESSAGES.FOUR_DECIMAL_ALLOWED_PATTERN_ERROR';
        }

        if (surfaceUnit === AreaMeasurementUnits.MEASURE_UNIT_ARES) {
            const valid = this.regexValidate.twoDecimals.test(surface.toString());
            return !valid && 'MESSAGES.TWO_DECIMAL_ALLOWED_PATTERN_ERROR';
        }

        if (surfaceUnit === AreaMeasurementUnits.MEASURE_UNIT_CENTIARE) {
            const valid = this.regexValidate.int12.test(surface.toString());
            return !valid && 'MESSAGES.INTEGER_ALLOWED_PATTERN_ERROR';
        }

        return 'MESSAGES.CONVERSION_NOT_ALLOWED';
    }

    /**
     * Returns a string that reprensents the area in the format of 0ha00a00ca
     *
     * @param area
     * @param areaUnit
     */
    static getAreaRepresentation(area: number, areaUnit: AreaMeasurementUnitEnum): string {
        if (!area || !areaUnit) {
            return '';
        }
        const sfc = Utils.decomposeToHectaresAresAndCentiares(area, areaUnit);
        return sfc.error
            ? ''
            : `${Math.floor(sfc.hectares) || '0'}ha${Math.floor(sfc.ares) || '00'}a${
                  Math.round(sfc.centiares) || '00'
              }ca`;
    }

    static convertAreaToHectares(area: number, areaUnit: AreaMeasurementUnitEnum): number {
        if (areaUnit === AreaMeasurementUnits.MEASURE_UNIT_HECTARE) {
            return area;
        }

        return Utils.convertAreaValue(area, areaUnit, AreaMeasurementUnits.MEASURE_UNIT_HECTARE);
    }

    static parseFloat(num: any): number {
        if (Number.isNaN(Number.parseFloat(num))) {
            return null;
        } else {
            return Number.parseFloat(num);
        }
    }

    static parseInt(num: any): number {
        if (Number.isNaN(Number.parseInt(num, 10))) {
            return null;
        } else {
            return Number.parseInt(num, 10);
        }
    }

    static setDate(obj: any): Date {
        return obj ? new Date(obj) : null;
    }

    static uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            // eslint-disable-next-line no-bitwise, eqeqeq
            const r = (Math.random() * 16) | 0;
            const v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    static setParamsFromArgs(params: HttpParams, args: any = {}): HttpParams {
        if (args.page) {
            params = params.set('page', args.page);
        }
        if (args.perPage) {
            params = params.set('perPage', args.perPage);
        }
        if (args.orderBy) {
            params = params.set('orderBy', args.orderBy);

            if (args.direction) {
                if (args.direction === -1) {
                    params = params.set('direction', 'ASC');
                } else {
                    params = params.set('direction', 'DESC');
                }
            }
        }

        if (args.searchField && args.searchText) {
            params = params.set('searchField', args.searchField);
            params = params.set('searchText', args.searchText);
        }

        return params;
    }
}

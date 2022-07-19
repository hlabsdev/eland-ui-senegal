import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { TreeNode, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { Selectable } from '@app/core/interfaces/selectable.interface';
import * as moment from 'moment';
import { map } from 'rxjs/operators';
import { Form } from '@app/core/models/form.model';
import { FieldConfig } from '@app/core/models/field.model';
import { Validators } from '@angular/forms';
import { ValidationService } from '@app/core/utils/validation.service';
import { UserPreferences } from '@app/core/models/userPreferences.model';
import { CodeList } from '@app/core/models/codeList.model';

@Injectable({
    providedIn: 'root',
})
export class UtilService {
    // key to access user preferences in Local Storage
    private userSettingsKey = 'preferences';

    constructor(
        private translateService: TranslateService,
        private router: Router,
        private validationService: ValidationService,
        private confirmationService: ConfirmationService,
    ) {}

    sinceNow(date: Date): string {
        if (!date) {
            return null;
        }
        return moment(date).locale(this.translateService.currentLang).fromNow();
    }

    getSelectPlaceholder(placeholder = 'COMMON.ACTIONS.SELECT'): SelectItem {
        const item: SelectItem = { value: null, label: null };
        this.translateService.get(placeholder).subscribe((label) => (item.label = label));
        return item;
    }

    addSelectPlaceholder(selectItems: SelectItem[], placeholder = 'COMMON.ACTIONS.SELECT'): SelectItem[] {
        selectItems.unshift(this.getSelectPlaceholder());
        return selectItems;
    }

    mapToSelectItems(
        obs: Observable<Selectable[]>,
        prefix: string = null,
        valuePath = 'value',
        placeholder = 'COMMON.ACTIONS.SELECT',
    ): Observable<SelectItem[]> {
        return obs.pipe(map((items) => this.getTranslatedToSelectItem(items, valuePath, prefix, placeholder)));
    }

    getTranslatedToSelectItem(
        items: Selectable[],
        valuePath = 'value',
        prefix?: string,
        placeholder = 'COMMON.ACTIONS.SELECT',
    ): SelectItem[] {
        const selectItems = items.map((item) => item.toSelectItem());
        if (prefix) {
            selectItems.forEach((item) =>
                this.translateService
                    .get(`${prefix}.${_.get(item, valuePath)}`)
                    .subscribe((label) => (item.label = label)),
            );
        }
        selectItems.unshift(this.getSelectPlaceholder(placeholder));
        return selectItems;
    }

    eachDeep(obj, cb, avoidRecurse = []) {
        _.each(obj, (...args) => {
            if ((_.isObject(args[0]) || _.isArray(args[0])) && !avoidRecurse.includes(args[0])) {
                avoidRecurse.push(args[0]);
                this.eachDeep(args[0], cb, avoidRecurse);
            }
            cb(...args);
        });
    }

    move(inputArray: any[], fromIndex: number, toIndex: number) {
        if (
            Array.isArray(inputArray) &&
            _.inRange(fromIndex, 0, inputArray.length) &&
            _.inRange(toIndex, 0, inputArray.length)
        ) {
            inputArray.splice(toIndex, 0, inputArray.splice(fromIndex, 1)[0]);
        }
    }

    moveTo(inputArray: any[], item: any, toIndex: number = null) {
        if (Array.isArray(inputArray)) {
            this.move(inputArray, inputArray.indexOf(item), toIndex || inputArray.length - 1);
        }
    }

    moveUp(inputArray: any[], item: any) {
        if (Array.isArray(inputArray)) {
            this.move(inputArray, inputArray.indexOf(item), inputArray.indexOf(item) - 1);
        }
    }

    openLink(url: string) {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('visibility', 'hidden');
        link.setAttribute('download', null);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    openTab(url: string) {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('visibility', 'hidden');
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    moveDown(inputArray: any[], item: any) {
        this.move(inputArray, inputArray.indexOf(item), inputArray.indexOf(item) + 1);
    }

    mapDeep(obj: any, iterator: Function, context?: any) {
        return (_.isObject(obj) ? _.transform : _.map)(obj, (result, val, key) => {
            result[key] = _.isObject(val)
                ? this.mapDeep(val, iterator, context)
                : iterator.call(context, val, key, obj);
        });
    }

    toggleExpandTreeNodes(nodes: TreeNode[], allowExpand: boolean) {
        nodes.forEach((node) => {
            this.expandRecursive(node, allowExpand);
        });
    }

    expandRecursive(node: TreeNode, isExpand: boolean) {
        node.expanded = isExpand;
        if (node.children) {
            node.children.forEach((childNode) => {
                this.expandRecursive(childNode, isExpand);
            });
        }
    }

    navigateTo(url: string | string[], args) {
        const navUrl: any = _.isString(url) ? [url] : url;
        this.router.navigate(navUrl, args);
    }

    /**
     * Return the form fields configuration
     *
     * @param form The form to obtain the fields configuration
     */
    public getFormFieldConfig(form: Form): FieldConfig[] {
        const formInputs: any[] = (form.body && JSON.parse(form.body)) || [];
        const formFieldsConfiguration: FieldConfig[] = formInputs.map((input) => this.createField(input));
        return formFieldsConfiguration;
    }

    /**
     * Convert a field json object into a FieldConfig object
     *
     * @param jsonField The Field json object
     */
    createField(jsonField: any): FieldConfig {
        // If there is a validation then it will load the Validator object
        if (jsonField.validations) {
            const validations = jsonField.validations.map((element) => {
                if (element.validator) {
                    if ('Validators.required' === element.validator) {
                        element.validator = Validators.required;
                    } else if ('Validators.pattern(validationService.phoneRegEx)' === element.validator) {
                        element.validator = Validators.pattern(this.validationService.phoneRegEx);
                    } else if ('Validators.pattern(validationService.emailRegEx)' === element.validator) {
                        element.validator = Validators.pattern(this.validationService.emailRegEx);
                    } else if ('Validators.pattern(validationService.passwordRegEx)' === element.validator) {
                        element.validator = Validators.pattern(this.validationService.passwordRegEx);
                    } else if ('Validators.pattern(validationService.languageKeywordRegEx)' === element.validator) {
                        element.validator = Validators.pattern(this.validationService.languageKeywordRegEx);
                    } else if ('Validators.pattern(validationService.numberRegEx)' === element.validator) {
                        element.validator = Validators.pattern(this.validationService.numberRegEx);
                    } else if ('Validators.pattern(validationService.intRegEx)' === element.validator) {
                        element.validator = Validators.pattern(this.validationService.intRegEx);
                    } else if ('Validators.pattern(validationService.positiveDecimalRegEx)' === element.validator) {
                        element.validator = Validators.pattern(this.validationService.positiveDecimalRegEx);
                    } else if ('Validators.pattern(validationService.alphanumericRegEx)' === element.validator) {
                        element.validator = Validators.pattern(this.validationService.alphanumericRegEx);
                    } else {
                        element.validator = Validators.pattern(element.validator);
                    }
                }
                return element;
            });
            jsonField.validations = validations;
        }

        return new FieldConfig(jsonField);
    }

    /**
     * Returns TRUE if the first specified array contains all elements
     * from the second one. FALSE otherwise.
     *
     * @param superset
     * @param subset
     *
     * @returns
     */
    public arrayContainsArray(superset, subset) {
        if (0 === subset.length) {
            return false;
        }
        return subset.every(function (value) {
            return superset.indexOf(value) >= 0;
        });
    }

    /**
     * save language preferences in Local Storage
     *
     * @param userPreferences
     */
    public saveLanguagePreferencesToLocalStorage(userPreferences: UserPreferences) {
        let settings = JSON.parse(localStorage.getItem(this.userSettingsKey));
        if (settings) {
            const index = _.findIndex(settings, { username: userPreferences.username });
            if (index === -1) {
                settings.push(userPreferences);
            } else {
                settings[index] = userPreferences;
            }
        } else {
            settings = [];
            settings.push(userPreferences);
        }
        localStorage.setItem(this.userSettingsKey, JSON.stringify(settings));
    }

    /**
     * load language preferences from Local Storage
     *
     * @param username
     */
    public loadLanguagePreferencesFromLocalStorage(username: string) {
        const settings = JSON.parse(localStorage.getItem(this.userSettingsKey));
        if (settings) {
            const index = _.findIndex(settings, { username });
            if (index > -1) {
                const userPreferences: UserPreferences = settings[index];
                return userPreferences.language;
            } else {
                const newUserPreferences: UserPreferences = { username, language: this.translateService.defaultLang };
                this.saveLanguagePreferencesToLocalStorage(newUserPreferences);
            }
        }
        return null;
    }

    /**
     * Translates the codelist value and stores it in translated valueTranslated
     *
     * @param username
     */
    public translateCodeList(codeList: CodeList): CodeList {
        codeList.valueTranslated = this.translateService.instant('CODELIST.VALUES.' + codeList.value);
        return codeList;
    }

    /**
     * Display a confirm dialog and execute the specifies accept or reject function
     *
     * @param message Generic confirmation message to be translated ex: 'MESSAGES.CONFIRM_TASK_ASSIGN'
     * @param acceptFunction The function to be executed if the confirmation is accepted
     * @param rejectFunction The function to be executed if the confirmation is rejected
     */
    public displayConfirmationDialog(message: string, acceptFunction: Function, rejectFunction?: Function) {
        rejectFunction = rejectFunction ? rejectFunction : () => {};

        message = this.translateService.instant(message);
        this.confirmationService.confirm({
            message,
            accept: acceptFunction,
            reject: rejectFunction,
        });
    }

    /**
     * Display a confirm dialog and execute the specifies accept or reject function
     *
     * @param message Generic confirmation message to be translated ex: 'MESSAGES.CONFIRM_TASK_ASSIGN'
     * @param messageParameters The parameters to be pass to the message translation
     * @param acceptFunction The function to be executed if the confirmation is accepted
     * @param rejectFunction The function to be executed if the confirmation is rejected
     */
    public displayConfirmationDialogWithMessageParameters(
        message: string,
        messageParameters: any,
        acceptFunction: Function,
        rejectFunction?: Function,
    ) {
        rejectFunction = rejectFunction ? rejectFunction : () => {};

        message = this.translateService.instant(message, messageParameters);
        this.confirmationService.confirm({
            message,
            accept: acceptFunction,
            reject: rejectFunction,
        });
    }
}

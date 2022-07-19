import { TranslateService } from '@ngx-translate/core';
import { ValidationResult } from './models/validationResult.model';
import { ErrorResult } from './models/errorResult.model';
import { NgForm, FormGroup } from '@angular/forms';
import { Injectable } from '@angular/core';
import Utils from './utils';

const defaultDateFormat = 'DD/MM/YYYY';

@Injectable()
export class ValidationService {
    passwordRegEx = Utils.regexValidate.password;
    emailRegEx = Utils.regexValidate.email;
    phoneRegEx = Utils.regexValidate.phone;
    numberRegEx = Utils.regexValidate.number;
    intRegEx = Utils.regexValidate.int;
    int12RegEx = Utils.regexValidate.int12;
    positiveDecimalRegEx = Utils.regexValidate.positiveDecimal;
    fourDecimalsRegEx = Utils.regexValidate.fourDecimals;
    twoDecimalsRegEx = Utils.regexValidate.fourDecimals;
    yearDigitFormat = Utils.regexValidate.yearDigitFormat;
    languageKeywordRegEx = Utils.regexValidate.languageKeyword;
    searchByVariableRegEx = Utils.regexValidate.searchByVariable;
    alphanumericRegEx = Utils.regexValidate.alphanumeric;

    constructor(private translateService: TranslateService) {}

    validateEmail(value: any): ErrorResult {
        const valid = this.emailRegEx.test(value);
        return !valid ? new ErrorResult('MESSAGES.EMAIL_PATTERN_ERROR') : null;
    }

    validateAlpha(value: any): ErrorResult {
        const valid = this.alphanumericRegEx.test(value);
        return !valid ? new ErrorResult('MESSAGES.ALPHANUMERIC_PATTERN_ERROR') : null;
    }

    // iterate through fields and return first error found
    validateForm(form: NgForm): ErrorResult {
        if (form.invalid) {
            for (const controlKey of Object.keys(form.controls)) {
                const formControl = form.controls[controlKey];
                if (formControl.errors) {
                    if (formControl.errors['invalidDate']) {
                        return new ErrorResult('MESSAGES.DATE_PATTERN_ERROR', { parameter: defaultDateFormat });
                    } else if (formControl.errors['pattern']) {
                        const patternError = Utils.patternMessages[formControl.errors.pattern.requiredPattern];
                        return new ErrorResult(patternError);
                    } else if (formControl.errors['required']) {
                        return new ErrorResult('MESSAGES.MANDATORY_FIELDS_ERROR');
                    }
                }
            }
        }
        if (form.controls.email && form.controls.email.value) {
            form.controls.email.setValue(form.controls.email.value.trim());
            return this.validateEmail(form.controls.email.value);
        }
        return null;
    }

    validateDynamicForm(form: FormGroup): ErrorResult {
        if (form.invalid) {
            for (const controlKey of Object.keys(form.controls)) {
                const formControl = form.controls[controlKey];
                if (formControl.errors) {
                    if (formControl.errors['invalidDate']) {
                        return new ErrorResult('MESSAGES.DATE_PATTERN_ERROR', { parameter: defaultDateFormat });
                    } else if (formControl.errors['pattern']) {
                        const patternError =
                            Utils.patternMessages[formControl.errors.pattern.requiredPattern.slice(1, -1)];
                        return new ErrorResult(patternError);
                    } else if (formControl.errors['required']) {
                        return new ErrorResult('MESSAGES.MANDATORY_FIELDS_ERROR');
                    }
                }
            }
        }
        return null;
    }

    validateLanguageKeyword(value: any): ValidationResult {
        const valid = this.languageKeywordRegEx.test(value);
        const message = this.translateService.instant('COMMON.MESSAGES.LANGUAGE_KEYWORD_PATTERN_ERROR');
        return valid ? new ValidationResult(true) : new ValidationResult(false, message);
    }
}

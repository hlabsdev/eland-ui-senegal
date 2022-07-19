'use strict';
export const defaultLocale = 'fr-SN';
export const longDate = 'd MMM y HH:mm';

// we need this specifically for calandars.
export function getlocaleConstants(locale) {
    let localeSettings;
    switch (locale) {
        case 'fr-SN':
            localeSettings = {
                firstDayOfWeek: 0,
                dayNames: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
                dayNamesShort: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
                dayNamesMin: ['di', 'lu', 'ma', 'me', 'je', 've', 'sa'],
                monthNames: [
                    'janvier',
                    'février',
                    'mars',
                    'avril',
                    'mai',
                    'juin',
                    'juillet',
                    'août',
                    'septembre',
                    'octobre',
                    'novembre',
                    'décembre',
                ],
                monthNamesShort: [
                    'janv.',
                    'févr.',
                    'mars',
                    'avr.',
                    'mai',
                    'juin',
                    'juil.',
                    'août',
                    'sept.',
                    'oct.',
                    'nov.',
                    'déc.',
                ],
                today: "Aujourd'hui",
                clear: 'Clair',
                dateFormat: 'dd-mm-yy',
            };
            break;

        default:
            localeSettings = {
                firstDayOfWeek: 0,
                dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                monthNames: [
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December',
                ],
                monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                today: 'Today',
                clear: 'Clear',
                dateFormat: 'dd-mm-yy',
            };
    }
    return {
        localeSettings,
    };
}

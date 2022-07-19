export const replaceSpaceAndAutoMaj = (input: string): string =>
    input
        .replace(/ /g, '_')
        .replace(/[^0-9a-zA-Z_]+/g, '')
        .toUpperCase();

import * as _ from 'lodash';

export const join = (fns: Function[]) => (v, b, tc) => {
    let combineResult = true;
    fns.forEach((fn) => (combineResult = combineResult && fn(v, b, tc)));
    return combineResult;
};

export const map = (fn: Function) => (v, b, tc) => fn(b, tc);
export const isEqual = (v, b, tc) => _.isEqual(v.get(b), v.get(tc));
export const isNotNull = (v, b, tc) => !(_.isNull(v.get(b)) || _.isNull(v.get(tc)));
export const isEqualAndNotNull = (v, b, tc) => join([isEqual, isNotNull])(v, b, tc);

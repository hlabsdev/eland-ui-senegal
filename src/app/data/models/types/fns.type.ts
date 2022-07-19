export type xFN<T> = xxFN<T, T>;
export type pxFN<T> = xxFN<Partial<T>, T>;
export type xxFN<T, Y> = (n: T) => Y;

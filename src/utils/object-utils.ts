
export const getKeyValue = <T, K extends keyof T>(obj: T, key: K): T[K] => obj[key];
/** Другой вариант */
export const getProperty = <T, K extends keyof T>(obj: T, key: K) => obj[key];

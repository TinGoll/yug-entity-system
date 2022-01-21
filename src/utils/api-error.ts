import { getSystemErrorMap } from "util"

export enum EntityErrors {
    UNSPECIFIED = 1
}

const errorMessages: string[] = [
    'Сущность не определе, создавайте сущности только спомощью Engine.create()',
]

/**
 * 
 * @param num 1 - Неопределенная сущность
 */
export const getError = (num: EntityErrors) => {
    const msg = errorMessages[num - 1];
    return new Error(msg||'Неизветсная ошибка')
}
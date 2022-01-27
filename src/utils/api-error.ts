import { getSystemErrorMap } from "util"

export enum EntityErrors {
    UNSPECIFIED = 1,
    FORBIDDEN_TO_CHANGE = 2,
    PROPERTY_NOT_DEFINED = 3,
    WRONG_KEY = 4

}

const errorMessages: string[] = [
    'Сущность не определе, создавайте сущности только спомощью Engine.create()',
    'Изменять данное ствойство запрещено.',
    'Данное свойство не определено в данной сущности.',
    'Некорректный ключ сущности.'
]

/**
 * 
 * @param num 1 - Неопределенная сущность
 */
export const getError = (num: EntityErrors) => {
    const msg = errorMessages[num - 1];
    return new Error( msg || 'Неизветсная ошибка')
}
import { ApiComponent, ApiEntity } from "../@engine-types";

let eId = 1;
let cId = 1;
let maxTime = 2000;

const delay = async <T extends any = any>(object: T, time: number): Promise<T> => {
    return new Promise((reolve, reject) => {
        setTimeout(() => reolve(object), time)
    });
}

export const insertEntities = (entities: ApiEntity[]): Promise<ApiEntity[]> => {
    try {
        const time = (Math.floor(Math.random() * maxTime))
        console.log(`Время вставки ${entities.length} сущности в бд  сек: `, time / 1000);
        entities.forEach(e => {
            e.id = eId++;
        });
        return delay(entities, (Math.floor(Math.random() * maxTime)));
    } catch (e) {
        throw e;
    }
}

export const insertComponents = (components: ApiComponent[]): Promise<ApiComponent[]> => {
    try {
        const time = (Math.floor(Math.random() * maxTime))
        console.log(`Время вставки ${components.length} компонента в бд сек: `, time / 1000);
        components.forEach(c => {
            c.id = cId++;
        });
        return delay(components, time);
    } catch (e) {
        throw e;
    }
}

export const loadingEntities = (key: string): Promise<ApiEntity[]> => {
    const time = (Math.floor(Math.random() * maxTime))
    console.log(`Время загрузки сек:`, time / 1000, key);
    const entity: ApiEntity = {
        id: 55,
        key,
        name: "",
        index: 0,
        components: [],
        indicators: {}
    }
    const entity2: ApiEntity = {
        id: 56,
        key: "Ключ дочерней сущности",
        name: "",
        index: 0,
        components: [],
        indicators: {},
        parentKey: key
    }
    return delay([
       // entity,
    ], time);
}

export const deleteEntities = (keys: string[]): Promise<string[]> => {
    const time = (Math.floor(Math.random() * maxTime))
    console.log(`Время удаления сек:`, time / 1000);
    return delay(keys, time);
}

export const updateEntities = (entities: ApiEntity[]): Promise<ApiEntity[]> => {
    try {
        const time = (Math.floor(Math.random() * maxTime))
        console.log(`Время обновления ${entities.length} сек:`, time / 1000);
       // throw new Error("Тест ошибки обновления сущности")
        return delay(entities.map(e => ({...e, name: `${e.name} (изменено)`})), time);
    } catch (error) {
        throw error;
    }
}
export const updateComponents = (components: ApiComponent[]): Promise<ApiComponent[]> => {
    try {
        const time = (Math.floor(Math.random() * maxTime))
        console.log(`Время обновления ${components.length} сек:`, time / 1000);
       // throw new Error("Тест ошибки обновления")
        return delay(components.map(c => ({...c, propertyValue: 100500})), time);
    } catch (error) {
        throw error;
    }
}


/**
 * console color
 * Reset = "\x1b[0m"
Bright = "\x1b[1m"
Dim = "\x1b[2m"
Underscore = "\x1b[4m"
Blink = "\x1b[5m"
Reverse = "\x1b[7m"
Hidden = "\x1b[8m"

FgBlack = "\x1b[30m"
FgRed = "\x1b[31m"
FgGreen = "\x1b[32m"
FgYellow = "\x1b[33m"
FgBlue = "\x1b[34m"
FgMagenta = "\x1b[35m"
FgCyan = "\x1b[36m"
FgWhite = "\x1b[37m"

BgBlack = "\x1b[40m"
BgRed = "\x1b[41m"
BgGreen = "\x1b[42m"
BgYellow = "\x1b[43m"
BgBlue = "\x1b[44m"
BgMagenta = "\x1b[45m"
BgCyan = "\x1b[46m"
BgWhite = "\x1b[47m"
 */
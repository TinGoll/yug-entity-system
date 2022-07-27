import { ApiComponent, ApiEntity } from "../@engine-types";

let eId = 1;
let cId = 1;
let maxTime = 2000;

const delay = async <T extends any = any>(
  object: T,
  time: number
): Promise<T> => {
  return new Promise((reolve, reject) => {
    setTimeout(() => reolve(object), time);
  });
};

export const loadComponent = async (): Promise<ApiComponent[]> => {
  const time = Math.floor(Math.random() * maxTime);
  console.log(`Время загрузки шаблонов компонентов в сек: `, time / 1000);

  return delay(
    [
      {
        id: 1,
        key: "cmp:e9771810-e10a-4703-8534-7dc936b0f32a",
        index: 1,
        componentName: "geometry",
        componentDescription: "Геометрия",
        propertyName: "name_not_set",
        propertyDescription: "",
        propertyValue: "",
        propertyType: "string",
        indicators: { is_not_sent_notification: true },
        bindingToList: undefined,
        attributes: undefined,
        propertyFormula: undefined,
        entityKey: undefined,
        sampleKey: undefined,
        componentCategory: "",
      },
      {
        id: 2,
        key: "cmp:e15ff655-cdf1-4884-a570-a6864599227f",
        index: 2,
        componentName: "geometry",
        componentDescription: "Геометрия",
        propertyName: "height",
        propertyDescription: "Высота",
        propertyValue: 0,
        propertyType: "number",
        indicators: { is_changeable: true },
        bindingToList: undefined,
        attributes: undefined,
        propertyFormula: undefined,
        entityKey: undefined,
        componentCategory: "",
      },
      {
        id: 3,
        key: "cmp:0613cf3b-380f-46d5-97e5-0e1f6f960107",
        index: 3,
        componentName: "geometry",
        componentDescription: "Геометрия",
        propertyName: "width",
        propertyDescription: "Ширина",
        propertyValue: 0,
        propertyType: "number",
        indicators: { is_changeable: true },
        bindingToList: undefined,
        attributes: undefined,
        propertyFormula: undefined,
        entityKey: undefined,
        componentCategory: "",
      },
      {
        id: 4,
        key: "cmp:26799a43-05c4-4747-9e23-ed04e2636170",
        index: 4,
        componentName: "geometry",
        componentDescription: "Геометрия",
        propertyName: "amount",
        propertyDescription: "Количество",
        propertyValue: 0,
        propertyType: "number",
        indicators: { is_changeable: true },
        bindingToList: undefined,
        attributes: undefined,
        propertyFormula: undefined,
        entityKey: undefined,
        componentCategory: "",
      },
    ],
    Math.floor(Math.random() * maxTime)
  );
};

export const insertEntities = (entities: ApiEntity[]): Promise<ApiEntity[]> => {
  try {
    const time = Math.floor(Math.random() * maxTime);
    console.log(
      `Время вставки ${entities.length} сущности в бд  сек: `,
      time / 1000
    );
    entities.forEach((e) => {
      e.id = eId++;
    });
    return delay(entities, Math.floor(Math.random() * maxTime));
  } catch (e) {
    throw e;
  }
};

export const insertComponents = (
  components: ApiComponent[]
): Promise<ApiComponent[]> => {
  try {
    const time = Math.floor(Math.random() * maxTime);
    console.log(
      `Время вставки ${components.length} компонента в бд сек: `,
      time / 1000
    );
    components.forEach((c) => {
      c.id = cId++;
    });
    return delay(components, time);
  } catch (e) {
    throw e;
  }
};

export const loadingEntities = (key: string): Promise<ApiEntity[]> => {
  const time = Math.floor(Math.random() * maxTime);
  console.log(`Время загрузки сек:`, time / 1000, key);
  const entity: ApiEntity = {
    id: 55,
    key,
    name: "",
    index: 0,
    components: [],
    indicators: {},
  };
  const entity2: ApiEntity = {
    id: 56,
    key: "Ключ дочерней сущности",
    name: "",
    index: 0,
    components: [],
    indicators: {},
    parentKey: key,
  };
  return delay(
    [
      // entity,
    ],
    time
  );
};

export const deleteEntities = (keys: string[]): Promise<string[]> => {
  const time = Math.floor(Math.random() * maxTime);
  console.log(`Время удаления сек:`, time / 1000);
  return delay(keys, time);
};

export const deleteComponents = (keys: string[]): Promise<string[]> => {
  const time = Math.floor(Math.random() * maxTime);
  console.log(`Время удаления сек:`, time / 1000);
  return delay(keys, time);
};

export const updateEntities = (entities: ApiEntity[]): Promise<ApiEntity[]> => {
  try {
    const time = Math.floor(Math.random() * maxTime);
    console.log(`Время обновления ${entities.length} сек:`, time / 1000);
    // throw new Error("Тест ошибки обновления сущности")
    return delay(
      entities.map((e) => ({ ...e, name: `${e.name} (изменено)` })),
      time
    );
  } catch (error) {
    throw error;
  }
};
export const updateComponents = (
  components: ApiComponent[]
): Promise<ApiComponent[]> => {
  try {
    const time = Math.floor(Math.random() * maxTime);
    console.log(`Время обновления ${components.length} сек:`, time / 1000);
    // throw new Error("Тест ошибки обновления")
    return delay(
      components.map((c) => ({ ...c })),
      time
    );
  } catch (error) {
    throw error;
  }
};

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

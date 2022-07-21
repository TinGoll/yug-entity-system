import { timing } from "./@decorators";
import {
  ApiComponent,
  ApiEntity,
  ComponentDto,
  EngineObjectType,
  EntityDto,
  EntityShell,
} from "./@engine-types";
import Component from "./Component";
import { Engine } from "./Engine";
import Entity from "./Entity";

export default class Creator {
  private _engine: Engine;
  /**
   * Создание creator.
   * @param engine объект движка.
   */
  constructor(engine: Engine) {
    this._engine = engine;
  }

  /** Получить объект движка */
  getEngine(): Engine {
    return this._engine;
  }
  /** Получить объект движка */
  get engine(): Engine {
    return this.getEngine();
  }

  /**
   * Открыть сущность по ключу
   * @param key ключу сущности
   * @returns Entity
   */
  async open(key: string): Promise<Entity | null> {
    const shell = await this._engine.findOne(key);
    if (!shell) return null;
    // const entity = new Entity(shell, this._engine);
    return this.engine.creator.shellToEntity(shell);
  }
  /**
   * Конвертация оболочки сущности в объект класса сущности.
   * @param shell
   * @returns
   */
  shellToEntity(shell: EntityShell): Entity {
    return new Entity(shell, this._engine);
  }
  /**
   * Создание сущности
   * @param type "entity"
   * @param dto Объект определения сущности.
   * @param components Необязательно. Дополнительно можно задать массив компонентов.
   */
  create(
    type: "entity",
    dto: EntityDto,
    response?: (...args: any[]) => void,
    reject?: (...args: any[]) => void,
    ...components: ApiComponent[]
  ): Promise<Entity>;
  /**
   * Создание компонента.
   * @param type "component"
   * @param dto Объект определения компонента.
   * @param components необязательно. Дополнительно, можно указать массив свойств.
   */
  create(
    type: "component",
    dto: ComponentDto,
    response?: (...args: any[]) => void,
    reject?: (...args: any[]) => void,
    ...components: ApiComponent[]
  ): Promise<Component>;
  async create(
    type: EngineObjectType,
    ...args: any[]
  ): Promise<Entity | Component | void> {
    try {
      // Создание сущности
      if (type === "entity") {
        const [dto, response, reject, ...components] = <
          [
            EntityDto,
            (...args: any[]) => void,
            (...args: any[]) => void,
            ...ApiComponent[]
          ]
        >args;
        if (!dto || !dto.name)
          throw new Error(`Некоректные данные, для создания ${type}.`);
        const shell = this.engine.createEntityShell(
          {
            ...dto,
            components: [
              ...this.concatenateApiComponents(
                ...components,
                ...(dto.components || [])
              ),
            ],
          },
          response,
          reject
        );
        return new Entity(shell, this._engine);
      }

      // Создание компонента.
      if (type === "component") {
        const [dto, response, reject, ...components] = <
          [
            ComponentDto,
            (...args: any[]) => void,
            (...args: any[]) => void,
            ...ApiComponent[]
          ]
        >args;
        if (!dto || !dto.componentName)
          throw new Error(`Некоректные данные, для создания ${type}.`);
        components.forEach((c) => {
          c.componentName = dto.componentName;
          c.componentDescription = dto.componentDescription || "";
          c.entityKey = dto.entityKey;
        });
        const component = new Component(dto, this._engine, ...components);
        if ((dto.propertyName && dto.propertyType)) component.add(dto);
        
        const savable = component.notRecordedDatabase();
        const cmp = await this.engine.createComponentApi(
          response,
          reject,
          ...savable
        );
        return new Component(dto, this._engine, ...cmp);
      }
      throw new Error(`Тип объекта ""${type}" не поддерживается.`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Создание новой сущности по ключу шаблона (клонирование)
   * @param key ключ шаблона
   * @returns Сущность или null
   */
  async CreateFromTemplateKey(
    key: string,
    response?: (...args: any[]) => void,
    reject?: (...args: any[]) => void
  ): Promise<Entity | null> {
    const shell = await this._engine.cloneEntityShell(
      key,
      undefined,
      response,
      reject
    );
    if (!shell) return null;
    return this.shellToEntity(shell);
  }

  /**
   * Коллекор компонентов, для сборки и слияния.
   * @param components ApiComponent[]
   * @returns ApiComponent[]
   */
  concatenateApiComponents(...components: ApiComponent[]): ApiComponent[] {
    try {
      const tempArr = this.convertApiComponentsToComponents(...components);
      const arr: ApiComponent[] = [];
      if (tempArr.length === 1) return [...tempArr[0]];
      for (const tempCmp of tempArr) {
        tempCmp.concatenate(...components);
        arr.push(...tempCmp);
      }
      return arr;
    } catch (error) {
      throw error;
    }
  }
  /**
   * Конвертирование массива ApiComponent в массив Component
   * @param apiComponents ApiComponent[]
   * @returns Component []
   */
  convertApiComponentsToComponents(
    ...apiComponents: ApiComponent[]
  ): Component[] {
    try {
      const cmpNames: Array<{
        componentName: string;
        componentDescription: string;
        entityKey: string;
      }> = [
        ...new Set(
          apiComponents.map(
            (c) =>
              `${c.componentName}~${c.componentDescription}${
                c.entityKey ? `~${c.entityKey}` : ""
              }`
          )
        ),
      ]
        .map((c) => [...c.split("~")])
        .map((c) => ({
          componentName: c[0],
          componentDescription: c[1],
          entityKey: c[2],
        }));
      return cmpNames.map(
        (c) => new Component({ ...c }, this._engine, ...apiComponents)
      );
    } catch (e) {
      throw e;
    }
  }

  convertShellEntitiesToEntities(...shells: EntityShell[]): Entity[] {
    return shells.map((shell) => new Entity(shell, this._engine));
  }
  /**
   * Открытие компонента, в виде инстанса класа Комопнента, по имени.
   * @param componentName
   * @returns
   */
  async openSampleComponent(componentName: string): Promise<Component | null> {
    if (!this.engine.getComponentList().size) {
      await this.engine.loadComponents({ sample: true });
    }
    const firstCmp = this.engine.components.find(
      (c) => c.componentName === componentName
    );

    if (!firstCmp) return null;
    const cmps = this.engine.components.filter(
      (c) => c.componentName === componentName
    );
    const component = new Component({ ...firstCmp }, this.engine, ...cmps);
    return component;
  }
}

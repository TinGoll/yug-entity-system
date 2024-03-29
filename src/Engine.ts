import {
  ApiComponent,
  ApiEntity,
  ComponentDto,
  ComponentIndicators,
  EntityDto,
  EntityShell,
  ISerializable,
} from "./@engine-types";
import uuid from "uuid-random";
import Events from "./Events";
import Creator from "./Creator";
import TimerController from "./other/TimerController";
import RoomController from "./systems/RoomController";
import RoomControllerHeart from "./systems/RoomControllerHeart";

export class Engine extends Map<string, EntityShell> {
  private static instance?: Engine;
  private static interval: NodeJS.Timer;
  private static interval_time: number = 500;
  private static previous_time: number = 0;

  private _events: Events;
  private _creator: Creator;
  private _timers: TimerController;
  private _roomController: RoomControllerHeart;

  private componentList: Map<string, ApiComponent>;

  public сounter = 0;

  /**
   * Создание instance движка, по патерну singleton.
   * @returns singletone Engine.
   */
  public static create() {
    if (!Engine.instance) {
      Engine.instance = new Engine();
    }
    return Engine.instance;
  }

  // ENGINE SETTINGS

  set intervalTime(value: number) {
    Engine.interval_time = value;
  }
  get intervalTime() {
    return Engine.interval_time;
  }

  // Конструтор приватный, для ограничения вызова из вне.
  private constructor() {
    super();
    // Инициализация.
    this._events = new Events(this);
    this._creator = new Creator(this);
    this._timers = new TimerController();
    this._roomController = new RoomController(this);
    this.componentList = new Map<string, ApiComponent>();
    //this.start()
  }

  /** Установить новый контроллер комнат, по умолчанию, используется стандартный */
  setRoomController(controller: RoomControllerHeart): this {
    this._roomController = controller;
    return this;
  }
  /** Установить новый контроллер комнат, по умолчанию, используется стандартный */
  set roomController(controller: RoomControllerHeart) {
    this.setRoomController(controller);
  }
  /** Получить контроллер комнат, по умолчанию, используется стандартный */
  get roomController() {
    return this.getRoomController();
  }
  /** Получить контроллер комнат */
  getRoomController<T extends RoomControllerHeart = RoomControllerHeart>(): T {
    return <T>this._roomController;
  }
  /** Таймеры движка */
  getTimers() {
    return this._timers;
  }
  /** Таймеры движка */
  get timers() {
    return this.getTimers();
  }
  /** Получить дельта - тайм */
  getDeltaTime(): number {
    return Engine.previous_time > 0 ? Date.now() - Engine.previous_time : 0;
  }

  // *******************************************************************************
  // ********************************* ОБЪЕКТЫ *************************************
  // *******************************************************************************

  // ****************************** КЛОНИРОВАНИЕ СУЩНОСТЕЙ *************************

  /**
   * Асинхронный метод. Клонирование, создание новой сущности. +++
   * @param key Ключь клонируемой сущности.
   * @param parentKey Родительский ключ.
   * @returns  Promise<EntityShell | null>
   */
  async cloneEntityShell(
    key: string,
    parentKey?: string,
    response?: (...args: any[]) => void,
    reject?: (...args: any[]) => void
  ): Promise<EntityShell | null> {
    try {
      // Находим оболочку по ключу.
      const cloneable = await this.findOne(key);
      if (!cloneable) throw new Error("Клонируемая сущность не найдена."); // Если такой оболочки не найдено, ошибка.
      // Находим дочерние сущности, по тому же ключу.
      const childs = await this.find(key, "only children");
      // Клонируем оболочку.
      const candidate = this.clone_entity_shell(cloneable, parentKey);
      // Добавляем его в хранилище движка, не дождавшись сохранения в БД
      this.set(candidate.options.key, candidate);
      // Глубокое клонирование, копируем все дочерние сущности и компоненты. В нутри этого метода, копии помещаются в хранилище.
      const AllCloneable = await this.deep_cloning(
        childs,
        candidate.options.key
      );
      // Добавляем главную сущность.
      AllCloneable.unshift(candidate);
      // Сохраняем все клоны в БД.
      this.signEntities(AllCloneable)
        .then((savedShells) => {
          // Уведомеление всех пользователей в комнате.
          // Обновляем сущности в хранилище.
          for (const shell of savedShells) {
            if (this.has(shell.options.key)) {
              const cmp = this.get(shell.options.key)!;
              cmp.options = {
                ...cmp.options,
                ...shell.options,
                components: [
                  ...this.creator.concatenateApiComponents(
                    ...cmp.options.components,
                    ...shell.options.components
                  ),
                ],
              };
            }
          }
          if (response && typeof response === "function") response(savedShells);
          // Удаление автоответа, в место этого, выполняем функцию - response
          // const action: EngineAction = "create-entity-shell"
          // this._events.notifyEmit("Broadcast", action, savedShells);
        }) // Если успешно
        .catch((err) => {
          for (const cln of AllCloneable) {
            // Неудача при сохранении, удаляем все добавленные в хранилище сущности.
            this.delete(cln.options.key);
          }
          if (reject && typeof reject === "function") reject(err, AllCloneable);
        }) // если ошибка
        .finally(); // в любом случае.
      //await this.signEntities(AllCloneable) // Общая рассылка будет раньше чем личная отправка.
      return candidate;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  /**
   * приватный метод клонирования.
   * @param shell оболочка
   * @param parentKey родительский ключ
   * @returns
   */
  private clone_entity_shell(
    shell: EntityShell,
    parentKey?: string
  ): EntityShell {
    const newKey: string = this.keyGenerator("ent:");
    const sampleKey = shell.options.key;
    const newShell: EntityShell = {
      options: {
        ...shell.options,
        id: 0,
        key: newKey,
        parentKey,
        sampleKey,
        components: [
          ...this.clone_component_api(shell.options.components, newKey),
          // ...shell.options.components
          //     .map(c => ({ ...c, id: 0, entityKey: newKey, key: this.keyGenerator("cmp:") }))
        ],
        indicators: {
          is_unwritten_in_storage: true,
          is_not_sent_notification: true,
        },
      },
    };
    return newShell;
  }

  /**
   * Клонирование компонента
   * @param components массив компонентов
   * @param entityKey ключ сущности (необязательно)
   * @returns массив сохраненных компонентов.
   */
  cloneApiComponent(
    components: ApiComponent[],
    entityKey?: string
  ): ApiComponent[] {
    try {
      const cmps = this.clone_component_api(components, entityKey);
      return cmps;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Клонирование компонента, и сохранение в хранилище.
   * @param components массив компонентов
   * @param entityKey ключ сущности (необязательно)
   * @returns массив сохраненных компонентов.
   */
  async cloneApiComponentAndSave(
    components: ApiComponent[],
    entityKey?: string
  ): Promise<ApiComponent[]> {
    try {
      const cmps = this.clone_component_api(components, entityKey);
      const singedCmps = await this.signComponentApi(...cmps);
      return singedCmps;
    } catch (e) {
      throw e;
    }
  }

  private clone_component_api(
    components: ApiComponent[],
    entityKey?: string,
    isSample = false
  ): ApiComponent[] {
    return [
      ...components.map((c) => ({
        ...c,
        indicators: {
          ...c.indicators,
          is_unwritten_in_storage: true,
          is_not_sent_notification: true,
        },
        id: 0,
        key: this.keyGenerator("cmp:"),
        entityKey,
        sampleKey: isSample ? undefined : c.key,
      })),
    ];
  }

  /**
   * Приватный метод. Клонирование дочерних сущностей, любой вложенности.
   * @param childs список дочерних сущностей
   * @param parentKey родительский ключ
   */
  private async deep_cloning(
    childs: EntityShell[],
    parentKey: string
  ): Promise<EntityShell[]> {
    try {
      const tempArr: EntityShell[] = [];
      for (const cld of childs) {
        const subChild = await this.find(cld.options.key, "only children");
        const clone = this.clone_entity_shell(cld, parentKey);
        tempArr.push(clone);
        const d = await this.deep_cloning(subChild, clone.options.key)
        tempArr.push(...d);
        // Добавление в хранилище движка
        this.set(clone.options.key, clone);
      }
      return tempArr;
    } catch (e) {
      throw e;
    }
  }

  // ******************************** СОЗДАНИЕ СУЩНОСТЕЙ ***************************

  /**
   * Создание нового шаблона компонента
   * @param dto
   * @param components
   * @returns
   */
  async createSampleComponent(
    dto: ComponentDto,
    response?: (...args: any[]) => void,
    reject?: (...args: any[]) => void,
    ...components: ApiComponent[]
  ): Promise<ApiComponent[]> {
    try {
      dto.sampleKey = undefined;
      dto.entityKey = undefined;
      const candidate = [...this.componentList.values()].find(
        (c) =>
          c.componentName === dto.componentName &&
          c.propertyName === dto.propertyName
      );
      if (candidate) throw new Error("Такой компонент уже существует.");
      components = components.filter(
        (c) =>
          !(
            c.componentName === dto.componentName &&
            c.propertyName === dto.propertyName
          )
      );
      const component = await this.creator.create(
        "component",
        dto,
        response,
        reject,
        ...components
      );
      const apiData = [...component];
      // for (const cmp of apiData) {
      //     this.componentList.set(cmp.key, cmp);
      // }
      return apiData;
    } catch (e) {
      throw e;
    }
  }

  updateSampleComponent(componentKey: string, dto: ComponentDto) { }

  /**
   * Синхронный метод, для создания сущностей. Метод подписывает сущности. +++
   * @param dto Опции для создания сущности.
   * @returns оболочку сущности.
   */
  createEntityShell(
    dto: EntityDto,
    response?: (...args: any[]) => void,
    reject?: (...args: any[]) => void
  ): EntityShell {
    const { components = [], ...opt } = dto;
    const newOptions: ApiEntity = {
      id: 0,
      key: "",
      index: 0,
      components: [],
      indicators: { is_unwritten_in_storage: true },
      ...opt,
    };
    const shell = { options: this.registration<ApiEntity>(newOptions) };
    shell.options.components = this.clone_component_api(
      components,
      shell.options.key
    );
    this.set(shell.options.key, shell);

    this.signEntities([shell])
      .then((shellResponse: EntityShell[]) => {
        for (const rShell of shellResponse) {
          if (this.has(rShell.options.key)) {
            const entityShell = this.get(rShell.options.key)!;
            entityShell.options = {
              ...entityShell.options,
              ...rShell.options,
              components: [
                ...this.creator.concatenateApiComponents(
                  ...entityShell.options.components,
                  ...rShell.options.components
                ),
              ],
            };
          }
        }
        if (response && typeof response === "function") response(shellResponse);
        // Удаление автоответа, в место этого, выполняем функцию - response
        // Уведомление об успешной записи в хранилище.
        // const action: EngineAction = "create-entity-shell"
        // this._events.notifyEmit("Broadcast", action, response);
      })
      .catch((shellReject: [Error, Array<EntityShell>]) => {
        // Уведомить о то что запись в базу не удалась
        const [err, rejectShells] = shellReject;
        for (const shell of rejectShells) {
          // При  неудаче, удаляем все добавленные ранее сущности из памяти движка.
          this.delete(shell.options.key);
        }
        // Вызываем функцию, для передачи информацмм о ошибке, и массиве удаленных сущностей.
        if (reject && typeof reject === "function") reject(err, rejectShells);
      })
      .finally(() => console.log("Операция создания завершена."));
    return shell;
  }

  /**
   * Подписать сущности с помощью присвоения id (вставка в БД и получение id)
   * @param shells Оболочки сущности
   * @returns Подписаные оболочки.
   */
  async signEntities(shells: EntityShell[]): Promise<EntityShell[]> {
    // Списко apiEntities.
    const apiEntities = shells.map((sh) => ({ ...sh.options }));
    // Список компонентов.
    const components = shells.reduce<ApiComponent[]>((acc, item) => {
      acc.push(...item.options.components.map((c) => ({ ...c })));
      return acc;
    }, []);
    try {
      // Сохранение в базу данных
      const savedEntitiesApi = await this.events.createdEmit(
        "entity",
        apiEntities
      );
      const savedComponentApi = await this.events.createdEmit(
        "component",
        components
      );
      // Установка полученных изменений.
      shells.forEach((shell) => {
        const api = savedEntitiesApi.find((e) => e.key === shell.options.key);
        if (!api) {
          shell.options.indicators.is_removable = true;
        } else {
          const { is_unwritten_in_storage, is_changeable, ...indicators } =
            api.indicators; // Удаление индикатора о сохранении
          const cmps = shell.options.components; // получение предыдущего списка компонентов.
          const savedCmps = cmps.map((cmp) => {
            const apiCmp = savedComponentApi.find((c) => c.key === cmp.key);
            const { is_unwritten_in_storage, is_changeable, ...indic } =
              apiCmp?.indicators as ComponentIndicators;
            return { ...cmp, ...apiCmp, indicators: indic };
          });
          // Обновление данных в оболочке.
          shell.options = {
            ...shell.options,
            ...api,
            components: [...savedCmps],
            indicators: { ...indicators },
          };
        }
      });
      return shells;
    } catch (err) {
      shells.forEach((sh) => {
        sh.options.indicators.is_removable = true;
      });
      return Promise.reject([err, shells]);
    }
  }

  /**
   * Создание компонента
   * @param components
   * @returns
   */
  async createComponentApi(
    response?: (...args: any[]) => void,
    reject?: (...args: any[]) => void,
    ...components: ApiComponent[]
  ): Promise<ApiComponent[]> {
    const newComponents = this.clone_component_api(components, undefined, true);
    const savable = newComponents.filter(
      (c) => c.indicators.is_unwritten_in_storage
    );
    await this.signComponentApi(...savable)
      .then((cmps) => {
        for (const cmp of cmps) {
          const { is_unwritten_in_storage, is_changeable, ...indicators } =
            cmp.indicators;
          cmp.indicators = { ...indicators };
          this.componentList.set(cmp.key, cmp);
        }
        if (response && typeof response === "function") response(cmps);
      })
      .catch((reason) => {
        if (reject && typeof reject === "function") reject(reason);
      });
    return [...this.componentList.values()].filter((cmp) => {
      return components.find(
        (c) =>
          c.componentName === cmp.componentName &&
          c.propertyName === cmp.propertyName
      );
    });
  }

  /**
   * Подпись компонентов, присвоение id
   * @param components
   * @returns
   */
  async signComponentApi(
    ...components: ApiComponent[]
  ): Promise<ApiComponent[]> {
    try {
      const cmps = await this.events.createdEmit("component", components);
      cmps.forEach((cmp) => {
        const { is_unwritten_in_storage, ...indicators } = cmp.indicators;
        cmp.indicators = { ...indicators, is_changeable: true };
      });
      return cmps;
    } catch (err) {
      return Promise.reject([err, components]);
    }
  }

  /**
   * Обновление компонентов.
   * @param components
   * @returns
   */
  async updateComponentApi(
    ...components: ApiComponent[]
  ): Promise<ApiComponent[]> {
    try {
      const cmps = await this.events.updatedEmit(
        "component",
        components.filter((c) => c.id),
        "updateComponentApi"
      );
      cmps.forEach((cmp) => {
        const { is_unwritten_in_storage, is_changeable, ...indicators } =
          cmp.indicators;
        cmp.indicators = { ...indicators };
      });
      return cmps;
    } catch (err) {
      return Promise.reject([err, components]);
    }
  }

  // ****************************** ОБНОВЛЕНИЕ СУЩНОСТЕЙ ***************************

  updateEntityShell(
    shells: EntityShell[],
    response?: (...args: any[]) => void,
    reject?: (...args: any[]) => void
  ): EntityShell[] {
    const updatableShells = shells.filter((sh) => !!sh.options.id);
    const updatableEntities = updatableShells // Получение измененных сущностей.
      .filter(
        (sh) =>
          sh.options.indicators?.is_changeable &&
          !sh.options.indicators?.is_unwritten_in_storage
      )
      .map((sh) => ({ ...sh.options }));
    const updatableComponents = updatableShells // получение изменнных компонентов.
      .reduce<ApiComponent[]>((acc, item) => {
        acc.push(
          ...item.options.components
            .filter(
              (c) =>
                c.indicators?.is_changeable &&
                !c.indicators?.is_unwritten_in_storage
            )
            .map((c) => ({ ...c }))
        );
        return acc;
      }, []);
    // Сохранение изменений в базу данных.
    const updateResult = Promise.all([
      this.events.updatedEmit("entity", updatableEntities),
      this.events.updatedEmit(
        "component",
        updatableComponents,
        `updateEntityShell`
      ),
    ]);

    updateResult
      .then(([entityResult, componentResult]) => {
        entityResult.forEach((e) => {
          const { is_changeable, is_changeable_component, ...indc } =
            e.indicators;
          e.indicators = indc;
          e.indicators.is_not_sent_notification = true;
        });
        componentResult.forEach((c) => {
          const { is_changeable, ...indc } = c.indicators;
          c.indicators = indc;
          c.indicators.is_not_sent_notification = true;
        });
        updatableShells.forEach((shell) => {
          const entity = entityResult.find((e) => e.key === shell.options.key);
          if (entity) {
            const cmps = componentResult.filter(
              (c) => c.entityKey === entity.key
            );
            shell.options = {
              ...shell.options,
              ...entity,
              components: {
                ...shell.options.components,
                ...cmps,
              },
            };
          }
        });

        for (const shell of updatableShells) {
          if (this.has(shell.options.key)) {
            this.get(shell.options.key)!.options = {
              ...shell.options,
            };
          }
        }

        if (response && typeof response === "function")
          response(updatableShells);
        // Автоуведомление отключено, в место этого будет вызван response()
        // // Уведомление о обновлении
        // const action: EngineAction = "update-entity-shell";
        // this._events.notifyEmit("Broadcast", action, updatableShells);
      })
      .catch((obj) => {
        if (reject && typeof reject === "function") reject(obj, shells);
        console.log("updateEntityShell Error", obj);
      });
    return updatableShells;
  }

  // ******************************* УДАЛЕНИЕ СУЩНОСТЕЙ ****************************

  /**
   * Удаление сущностей, принимает массив ключей, возвращает кортеж
   * из ключей удаленных сущностей и массива удаленных зависимостей.
   * @param keys массив ключей удаляемых сущностей
   * @returns [deletedKeys, dependencyKeys]
   */
  async deleteEntityShell(keys: Array<string>): Promise<[string[], string[]]> {
    try {
      const deletedKeys = await this.events.deletedEmit("entity", keys);

      const dependencyKeys: string[] = [];

      for (const key of deletedKeys) {
        const tempArr = await this.remove_dependency(key);
        dependencyKeys.push(...tempArr);
        this.delete(key);
      }
      return [deletedKeys, dependencyKeys];
    } catch (e) {
      return Promise.reject([e, keys]);
    }
  }

  /**
   * Удаление сущностей, помеченых маркером "Удалить"
   */
  removeMarkedShells(
    response?: (...args: any[]) => void,
    reject?: (...args: any[]) => void
  ) {
    try {
      const keys: string[] = [];
      for (const shell of this.values()) {
        if (shell.options.indicators?.is_removable) {
          keys.push(shell.options.key);
        }
      }
      if (keys.length) {
        //const action: EngineAction = "delete-entity-shell";
        this.deleteEntityShell(keys).then((deletedData) => {
          if (response && typeof response === "function") response(deletedData);
          // this._events.notifyEmit("Broadcast", action, deletedData);
        });
      }
    } catch (e) {
      if (reject && typeof reject === "function") reject(e);
      throw e;
    }
  }

  /**
   * Удаление компонентов.
   * @param keys ключу компонентов.
   * @returns ключу удаленных компонентов.
   */
  async deleteComponents(keys: string[]): Promise<string[]> {
    try {
      const deletedKeys = await this.events.deletedEmit("component", keys);
      return deletedKeys || [];
    } catch (e) {
      return Promise.reject([e, keys]);
    }
  }

  /**
   * Удаление зависимостей сущности.
   * @param key ключ сущности, зависимости которой необходимо удалить
   * @returns массив ключей.
   */
  private async remove_dependency(key: string): Promise<string[]> {
    const keys: string[] = [];
    const childs = await this.find(key, "only children");
    for (const cld of childs) {
      const childKey = cld.options.key;
      keys.push(childKey);
      const tempArr = await this.remove_dependency(childKey);
      keys.push(...tempArr);
      this.delete(childKey);
    }
    return keys;
  }

  // ******************************* ЗАГРУЗКА СУЩНОСТЕЙ ****************************

  /**
   *
   * @returns
   */
  async loadComponents({
    sample,
  }: {
    sample?: boolean;
  }): Promise<ApiComponent[]> {
    try {
      const loadedComponents = await this.events.loadEmit(
        "component",
        "Find All",
        { sample: !!sample }
      );
      this.componentList.clear();
      for (const cmp of loadedComponents) {
        const { is_unwritten_in_storage, is_changeable, ...indicators } =
          cmp.indicators;
        cmp.indicators = { ...indicators };
        this.componentList.set(cmp.key, cmp);
      }
      return loadedComponents;
    } catch (e) {
      throw e;
    }
  }

  async loadEntityShell(key: string): Promise<EntityShell | null> {
    try {
      const loadedEntities = await this.events.loadEmit(
        "entity",
        "Find One",
        key
      );
      for (const entity of loadedEntities) {
        this.pushEntity(entity);
      }
      return this.get(key) || null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Загрузка сущностей массивом. Возвращает колличество загруженных сущностей
   * @param param0
   * @returns
   */
  async loadEntitiyShells({
    sample,
    where,
  }: {
    where?: {
      id?: Array<number>;
      keys?: Array<string>;
      categories?: Array<string>;
    };
    sample?: boolean;
  }): Promise<number> {
    const loadedEntities = await this.events.loadEmit("entity", "Find All", {
      sample,
      where,
    });
    for (const entity of loadedEntities) {
      this.pushEntity(entity);
    }
    return loadedEntities.length;
  }

  private pushEntity(api: ApiEntity) {
    if (this.has(api.key)) {
      this.get(api.key)!.options = { ...api };
    } else {
      this.set(api.key, { options: { ...api } });
    }
  }

  // ********************************* ПОИСК СУЩНОСТЕЙ *****************************

  /**
   * Поиск одного (!) EntityShell, без дочерних объектов.
   * @param key ключ сущности.
   * @returns EntityShell.
   */
  async findOne(key: string): Promise<EntityShell | null> {
    if (!this.has(key)) {
      return await this.loadEntityShell(key);
    }
    return this.get(key) || null;
  }

  /**
   * Получение родительской сущности, по (своему) ключу.
   * @param key ключ сущности, родителя которой, нужно найти.
   * @returns EntityShell | null.
   */
  async findParent(key: string): Promise<EntityShell | null> {
    const entity = this.has(key)
      ? this.get(key)!
      : await this.loadEntityShell(key);
    if (!entity || !entity.options?.parentKey) return null;

    if (!this.has(entity.options?.parentKey)) {
      return this.loadEntityShell(entity.options?.parentKey);
    }
    return this.get(entity.options.parentKey) || null;
  }

  /**
   * Поиск главного предка (наивысшей сущности)
   * @param key ключ сущности, предка которой, нужно найти.
   * @returns EntityShell | null.
   */
  async findAncestor(key: string): Promise<EntityShell | null> {
    let parent = await this.findParent(key);
    let isFinding: boolean = true;
    if (!parent) return null;
    let parent_key: string = parent.options.key;
    while (isFinding) {
      isFinding = false;
      const candidate = await this.findParent(parent_key);
      if (candidate) {
        isFinding = true;
        parent = candidate;
        parent_key = parent.options.key;
      }
    }
    return parent;
  }

  /**
   * Поиск EntityShell и всех принадлежащих ей дочерних сущностей.
   * @param key ключ сущности
   * @param depth глубина поиска: "only children" - только первый уровень, "all offspring" - все уровни.
   * @returns EntityShell[]
   */
  async find(
    key: string,
    depth?: "children and me" | "only children" | "all offspring"
  ): Promise<EntityShell[]> {
    if (!this.has(key)) {
      const result = await this.loadEntityShell(key);
      if (!result) return [];
    }
    const entity = this.get(key)!;
    const apiEntities: EntityShell[] = [];
    if (!depth || depth !== "only children") apiEntities.push(entity);
    for (const entry of this) {
      const child = entry[1];
      if (child.options.parentKey === entity.options.key) {
        if (!depth || depth === "all offspring") {
          apiEntities.push(
            ...(await this.find(child.options.key, "all offspring"))
          );
        }
        if (depth === "only children") {
          apiEntities.push(child);
        }
      }
    }
    return apiEntities;
  }

  /**
   * Получение всех сущностей, с которыми связана сущность, ключ которой передан в качестве аргумента.
   * @param key ключ сущности, связи которой, необходимо найти.
   * @returns EntityShell[]
   */
  async findDynasty(key: string): Promise<EntityShell[]> {
    if (!this.has(key)) {
      const result = await this.loadEntityShell(key);
      if (!result) return [];
    }
    const ancestor = await this.findAncestor(key);
    return this.find(ancestor?.options?.key || key, "all offspring");
  }

  // ********************************* ОЧИСТКА СУЩНОСТЕЙ ***************************
  /**
   * Выгрузка неиспользуемой сущности из памяти движка, выгружаеться все зависимости, как дочерние так и родительские.
   * @param key ключ сущности.
   */
  unloadToKey(key: string): void {
    this.findDynasty(key).then((dinasty) => {
      for (const shell of dinasty) {
        this.delete(shell.options.key);
      }
    });
  }

  /**
   * Очистка памяти движка, удаление всех сущностей.
   */
  clearAll(): void {
    this.clear();
  }

  // **********************************************************************************
  // ********************************* РЕГИСТРАЦИЯ ОБЪЕКТОВ ***************************
  // **********************************************************************************

  // Регистрация объекта, присвоение уникального ключе.
  registration<T extends ApiComponent | ApiEntity>(object: ISerializable): T {
    let prefix: "ent:" | "cmp:" | undefined = undefined;
    if ((<ApiEntity>object)?.name) prefix = "ent:";
    if ((<ApiComponent>object)?.componentName) prefix = "cmp:";
    if (!object?.key) {
      object.key = this.keyGenerator(prefix);
    }
    return <T>object;
  }
  // Генератор ключей.
  keyGenerator(pfx?: "ent:" | "cmp:"): string {
    if (!pfx) return uuid();
    return pfx + uuid();
  }

  get components(): ApiComponent[] {
    return [...this.componentList.values()];
  }

  getComponentList() {
    return this.componentList;
  }

  // *******************************************************************************
  // ********************************* События *************************************
  // *******************************************************************************

  // Получиить объект событий движка
  getEvents(): Events {
    return this._events;
  }
  // События движка.
  get events(): Events {
    return this.getEvents();
  }
  /** Получить объект creator */
  getCreator() {
    return this._creator;
  }
  /** Получить объект creator */
  get creator() {
    return this.getCreator();
  }

  // *******************************************************************************
  // ***************************** ЖИЗНЕННЫЙ ЦИКЛ **********************************
  // *******************************************************************************

  /**
   * Метод обновления, вызывается автоматически.
   * @param dt Время прошедшее между тактами.
   */
  protected update(dt: number) {
    this._timers.update(dt);
    this._roomController?.update(dt);
  }

  /** Старт цикла */
  public start(): this {
    Engine.previous_time = Date.now();
    Engine.interval = setInterval(() => {
      // Дельта - тайм в секундах.
      const now = Date.now();
      this.update((now - Engine.previous_time) * 0.001);
      Engine.previous_time = now;
    }, Engine.interval_time);
    console.log("\x1b[35m%s\x1b[0m", "Engine started working");
    return this;
  }
  /** * Остановка цикла */
  public stop(): this {
    clearInterval(Engine.interval);
    return this;
  }
  /** Освобождение ресурсов движка, остановка цикла, удаление. */
  public async dispouse(): Promise<void> {
    await this.stop();
    this.clear();
    this.events.removeAllListeners();
    Engine.instance = undefined;
    console.log("\x1b[31m%s\x1b[0m", "Engine stopped working");
  }

  public async restart(): Promise<void> {
    console.log(
      "\x1b[42m\x1b[30m%s\x1b[0m",
      "Engine restarting...",
      new Date().toLocaleString()
    );
    await this?.dispouse();
    Engine.create();
  }
}

import { ApiComponent, EngineAction, EntityShell, PropertyValue } from "../@engine-types";
import { Engine } from "../Engine";
import Entity from "../Entity";
import RoomController from "./RoomController";
import { Subscriber } from "./Subscriber";


export default abstract class Room<T extends any = string, U extends Subscriber<T> = Subscriber<T>> {
    protected roomController: RoomController;
    protected subscribers: Map<T, U>;
    protected engine: Engine;
    protected _entity: Entity | null;

    protected _key: T; 

    constructor(key: T, engine: Engine, entity?: Entity) {
        this._key = key;
        this.subscribers = new Map<T, U>();
        this.engine = engine;
        this.roomController = engine.roomController;
        this._entity = entity || null;
        this.recalculation();
    }

    /** Подписка */
    abstract subscribe(subscriber: Subscriber<T>, ...args: any[]): this;
    /** Отписка */
    abstract unsubscribe(subscriber: Subscriber<T>): this;

    // РАБОТА С СУЩНОСТЬЮ

    /**
     * Добавление новой сущности в существующую по ключу.
     * @param key ключ сущности, в которую надо вложить новую. (должен принадлежать данной комнате.)
     * @param addedKey ключ добавляемой сущности.
     */
    async addEntityByKey(key: string, addedKey: string): Promise<void> {
        const entity = await this._entity?.getEntityToKey(key);
        if (entity) {
            const addedEntity = await entity.addChildToKey(addedKey);
            if (addedEntity) {
                // Удачно, уведомить.
            } else {
                // Неудачно, уведомить.
            }
        }
    }

    /**
     * Добавление нового свойства в сущность, по ключу шаблона компонента.
     * @param key ключ сущности.
     * @param samplePropertyKeys ключ шаблона компонента.
     */
    async addPropertyToKey (key: string, samplePropertyKeys: string[]) {
        // Реализовать позже
        const cmps: ApiComponent[] = []
        for (const sKey of samplePropertyKeys) {
            const candidate = this.engine.components.find(cmp => cmp.key === sKey);
            if (candidate) cmps.push(candidate);
        }
        if (cmps.length) {
            const entity = await this.entity?.getEntityToKey(key);
            if (entity) {
                entity.addApiComponents(...cmps);
                const addedComponents = entity.getNotRecordedComponents();
                const updatedComponents = entity.getNotUpdatedComponents();
                const added = await this.engine.signComponentApi(...addedComponents);
                const updated = await this.engine.updateComponentApi(...updatedComponents);
                entity.setApiComponents(
                    ...added.map(c => ({...c, indicators: {...c.indicators, is_not_sent_notification: true}})), 
                    ...updated.map(c => ({ ...c, indicators: { ...c.indicators, is_not_sent_notification: true } })))
            }

            const [ entities, components ] = await this.recalculation();
            const action: EngineAction = "update-entity-shell";
            this.engine.events.notifyEmit("Broadcast", action, entities);

        }
    }

    /**
     * Удаление сущности по ключу, если сущность является главной, то после удаления комната будет уничтожена.
     * @param key ключ удаляемой сущности.
     */
    async deleteEntityByKey(key: string): Promise<void> {
        if (this._entity) {
            const action: EngineAction = "delete-entity-shell";
            if (this._entity?.key === key) {
                // Полное удаление всех сущностей комнаты.
                const allKeys = await this.engine.deleteEntityShell([key]);
                // Уведомить об удалении сущности.
                this.engine.events.notifyEmit("Broadcast", action, allKeys);
            } else {
                const deletedKey = await this._entity.deleteEntityToKey(key);
                // Уведомить об удалении сущности.
                this.engine.events.notifyEmit("Broadcast", action, deletedKey);
            }
        }
    }

    /**
     * Функция персчета всех сущностей, принадлежащей комнате.
     * Функция, так же отправляет на сохранение изменнные сущности.
     * И возвращает массив измененных оболочек сущностей и компонентов (Кортеж) [EntityShell[], ApiComponent[]].
     */
    async recalculation (): Promise<[EntityShell[], ApiComponent[]]> {
        try {
            const changedComponent = await this._entity?.recalculation() || [];
            const changedEntity = await this._entity?.getChangedEntities() || [];
            // Отключено автосохранение, после пересчета
            // const result = this.engine.updateEntityShell(changedEntity?.map(e => e.getShell()), 'recalculation');
            const result = changedEntity.map(c => c.getShell());

            return [[...result], [...changedComponent]];
        } catch (e) {
            throw e;
        }
    }

    async applyChanges (): Promise<Entity[]>  {
        if (!this.entity) return [];
       return this.entity?.getChangedEntities().then(chEntities => {
           this.engine.updateEntityShell(chEntities?.map(e => e.getShell()), 'applyChanges');
           return chEntities;
       });
    }

    /**
     * Изменение свойств сущности, по ключу.
     * @param key ключ сущности.
     * @param propertyKey ключ изменяемого свойства.
     * @param value новое значение.
     * @param args дополнительно можно передать подписчика
     */
    async editEntityToKey (key: string, propertyKey: string, value: PropertyValue, ...args: any[]): Promise<void> {
        const entity = await this._entity?.getEntityToKey(key);
        const [ subscriber ] = <[subscriber: Subscriber, ...other: any[]]> args;

        if (this._entity && entity) {
            entity.setValueToKey(propertyKey, value);
            await this._entity?.recalculation();
            const changedEntity = await this._entity.getChangedEntities();
            // Запись в базу данных, всех изменений и уведомление.
            const result = this.engine.updateEntityShell(changedEntity?.map(e => e.getShell()), 'editEntityToKey');
            if (subscriber && subscriber.data?.key) {
                this.engine.events.notifyEmit("One", subscriber, result);
            }
        }
    }

    /**
     * Получаем список оболочек сущностей в комнате.
     * @returns EntityShell[].
     */
    async getEntityShells(): Promise<EntityShell[]> {
        if (!this._entity || !this._entity?.key) return [];
        const shells = await this.engine.find(this._entity?.key, "all offspring");
        // this._entity.getShell()
        return [...shells,];
    }

    /**
     * Получение второго уровня сущностей
     * @returns  Promise<Entity[]>
     */
    async getSecondLevelEntities (): Promise<Entity[]> {
        return this._entity?.getChildren() || [];
    }
    /**
     * Получить сущность комнаты по ключу.
     * @param key ключ сущгости.
     */
    async getEntityRoom (key: string): Promise<Entity|null> {
        try {
            if (!this._entity) return null;
            const shells = await this.engine.findDynasty(this._entity.key);
            const candidateShell = shells.find(sh => sh.options.key === key);
            if (!candidateShell) return null;
            return this.engine.creator.shellToEntity(candidateShell);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Получить главную сущность комнаты.
     * @returns Entity или null
     */
    getEntity (): Entity | null {return this._entity}
    /**
     * Присвоить новую главную сущность комнаты.
     * @param entity 
     * @returns 
     */
    /**
     * Установка новой сущности в качестве главной.
     * @param entity главная сущность комнаты.
     * @returns this.
     */
    setEntity(entity: Entity | null): this {
        this._entity = entity || null;
        this.recalculation();
        return this;
    }  
    /**
     * Существет ли ключ сущности в данной комнате
     * @param key ключ 
     * @returns boolean
     */
    async existsEntityKey (key: string): Promise<boolean> {
        const keys = await this.getEntityKeys();
        return Boolean(keys.find(k => k === key))
    }

    /** Получить главную сущность комнаты */ 
    get entity() { return this.getEntity() }
    set entity(entity: Entity | null) { this.setEntity(entity)}

    async getEntityKeys (): Promise<string[]> {
        if (!this._entity) return [];
        const shells = await this.engine.findDynasty(this._entity.key);
        return shells.map(sh => sh.options.key);
    }
    isEmpty (): boolean {
        return !this.subscribers.size;
    }

    /** Получить ключ комнаты */
    getKey(): T { return this._key }
    /** Получить ключ комнаты */
    get key(): T { return this.getKey() }

    // УВЕДОМЛЕНИЯ

    /**
     * Уведомление все комнат, в которых открыты затронутые сущности.
     * @param args аргументы ответа.
     */
    notifyAllRooms(action: string, entityKey: string, ...args: any[]): void {
        this.roomController.notify(action, entityKey, ...args!);
    }

    /** метод удаления комнаты. */
    destroy(): void {
        for (const iterator of this.subscribers.values()) {
            iterator.data.rooms = [...iterator.data.rooms.filter(r => r !== this.key)]
        }
        if (this._entity) {
            this.roomController.isEntityOpen(this._entity?.key, <any> this.key).then((flag) => {
                if (!flag) {
                    this.engine.unloadToKey(this._entity!.key)
                }
            })
        }
        this.subscribers.clear()
    }

    /** Метод обновления комнатыю */
    async update(dt: number): Promise<void> {
        // Обновление комнаты
    }

    /**
     * Отправка всем подписчикам в комнате, метод, так же может вызывать roomController
     * @param action Экшен 
     * @param args аргументы
     */
    abstract sendNotificationToSubscribers(action: string, ...args: any[]): void
    abstract sendToOneSubscriber(action: string, subscriber: Subscriber<T>, ...args: any[]):void;

    /** Итератор, итерируемый объект Subscriber */
    [Symbol.iterator] = (): IterableIterator<U> => {
        return this.subscribers.values();
    }
}
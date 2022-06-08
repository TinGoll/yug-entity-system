import { EntityShell, PropertyValue } from "../@engine-types";
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
     * @param samplePropertyKey ключ шаблона компонента.
     */
    async addPropertyToKey (key: string, samplePropertyKey: string) {
        // Реализовать позже
    }

    /**
     * Удаление сущности по ключу, если сущность является главной, то после удаления комната будет уничтожена.
     * @param key ключ удаляемой сущности.
     */
    async deleteEntityByKey(key: string): Promise<void> {
        if (this._entity) {
            if (this._entity?.key === key) {
                const allKeys = await this.engine.deleteEntityShell([key]);
                // Полное удаление всех сущностей комнаты.
            } else {
                const deletedKey = await this._entity.deleteEntityToKey(key);
                // Уведомить об удалении сущности.
            }
        }
    }

    /**
     * Изменение свойств сущности, по ключу.
     * @param key ключ сущности.
     * @param propertyKey ключ изменяемого свойства.
     * @param value новое значение.
     */
    async editEntityToKey (key: string, propertyKey: string, value: PropertyValue): Promise<void> {
        const entity = await this._entity?.getEntityToKey(key);
        if (this._entity && entity) {
            entity.setValueToKey(propertyKey, value);
            await this._entity?.recalculation();
            const changedEntity = await this._entity.getChangedEntities();
            const result = this.engine.updateEntityShell(changedEntity?.map(e => e.getShell()));
            // Запись в базу данных, всех изменений и уведомление.
        }
    }

    /**
     * Получаем список оболочек сущностей в комнате.
     * @returns EntityShell[].
     */
    async getEntityShells(): Promise<EntityShell[]> {
        if (!this._entity || !this._entity?.key) return [];
        const shells = await this.engine.find(this._entity?.key, "all offspring");
        return [...shells, this._entity.getShell()];
    }

    /**
     * Получение второго уровня сущностей
     * @returns  Promise<Entity[]>
     */
    async getSecondLevelEntities (): Promise<Entity[]> {
        return this._entity?.getChildren() || [];
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
        return this;
    }  
    /** Получить главную сущность комнаты */ 
    get entity() { return this.getEntity() }
    set entity(entity: Entity | null) { this.setEntity(entity)}
    async getEntityKeys (): Promise<string[]> {
        if (!this._entity) return [];
        //const shells = await this.engine.find(this._entity?.key, "all offspring");
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
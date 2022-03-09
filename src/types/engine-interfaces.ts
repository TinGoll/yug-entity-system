import Creator from "../Models/Creator";
import { ApiComponent, ApiEntity } from "./entity-types";

/** Интерфейс обекта движка сущность/комопнент */
export interface EngineObject<T extends ApiComponent | ApiEntity = any> {
    /*********************************************************************************** */
    /** Сборка Комопонента/Сущности, для отправки по API клиент - сервер и наоборот. */
    build(): T[];
    /** Присвоение состояния  сущности/комопнента по данным метода build() */
    setState(state: T): void;
    /*********************************************************************************** */
    /** Название сущности/комопнента */
    getName(): string;
    /** Уникальный ключь сущности/комопнента, присваивается при создании. */
    getKey(): string;

    /*********************************************************************************** */
    /** Get - метод получения уникального ключа сущности/комопнента */
    get key() : string;

}

export type EngineObjectType = 'entity' | 'component';

export interface IEngine {
    /** Создание instance класса Creator. Creator используется для создания EngineObject. (Компоненты и сущности)  */
    creator(): Creator;
}

export interface ISerializable {
    key: string;
}
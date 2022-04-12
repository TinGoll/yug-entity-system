import Component from "./Component";
import Engine from "./Engine";
import Entity from "./Entity";
import { ApiComponent, ApiEntity, EngineObjectType } from "./types/engine-types";

export default class Creator {
    engine: Engine;
    constructor(engine: Engine) {
        this.engine = engine;
    }

    create(type: 'entity', name: string, options?: Partial<ApiEntity>): Entity;
    create(type: 'component', name: string, options?: Partial<ApiComponent>, arr?: ApiComponent[]): Component;
    create(type: EngineObjectType, name: string, options?: Partial<ApiComponent> | Partial<ApiEntity>, arr: ApiComponent[] = []): Entity | Component {
        switch (type) {
            case 'entity':
                const cpms = (<ApiEntity> options)?.components || [];
                const components: ApiComponent[] =  [...cpms, ...arr ];
                const newEntity: ApiEntity = {
                    ...options,
                    key: Engine.keyGenerator('ent:'),
                    name,
                    components
                }
                this.engine.set(newEntity);
                return new Entity(this.engine.get(newEntity.key)!, this.engine);
            case 'component':
                const { componentDescription = 'Описание компонента' } = <ApiComponent> options;
                return new Component({
                    componentName: name,
                    componentDescription: componentDescription
                }, arr)
            default:
                throw new Error("Не верный тип объекта.");
        }
    }

    getEntityToKey (key: string): Entity | undefined {
        if (!this.engine.has(key)) return;
        const apiEntity = this.engine.get(key)!;
        return new Entity(apiEntity, this.engine);
    }

    getEntityChildren (key: string): Entity[] {
        const apiEntities = this.engine.getСhildren(key);
        return apiEntities.map(e => new Entity(e, this.engine));
    }

    getDynasty(key: string): Entity[] {
        const tempEntities: Entity[] = [];
        const entity = this.getEntityToKey(key);
        if (!entity) return tempEntities;
        tempEntities.push(entity);
        tempEntities.push(...this.get_all_connections(entity.getChildrens()));
        return tempEntities;
    }

    private get_all_connections (children: Entity[]): Entity[] {
        const tempEntities: Entity[] = [];
        tempEntities.push(...children);
        for (const child of children) {
            tempEntities.push(...this.get_all_connections(child.getChildrens()));
        }
        return tempEntities;
    }
}
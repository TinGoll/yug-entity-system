import { Engine } from "../engine/Engine";
import { EngineObjectType } from "../types/engine-interfaces";
import { ApiOptionsComponent, ApiOptionsEntity } from "../types/entity-types";
import { Component } from "./components/Component";
import { Entity } from "./entities/Entity";

export default class Creator {
   
    constructor() {}

    create(type: 'entity', name: string, options?: Omit<ApiOptionsEntity, 'name'>): Entity;
    create(type: 'component', name: string, options?: Omit<ApiOptionsComponent, 'componentName'>): Component;
    create(type: EngineObjectType, name: string, options?: ApiOptionsEntity | Omit<ApiOptionsComponent, 'componentName'>): Entity | Component {
        switch (type) {
            case 'entity':
                const entityOpt: ApiOptionsEntity = { 
                    ...<ApiOptionsEntity>options,
                    name: name
                };
                const apiEntity = Engine.createObject('entity', entityOpt);
                Engine.setApiEntities([apiEntity]);
                return new Entity(apiEntity.key);
            case 'component':
                const componentOpt: ApiOptionsComponent = {
                    ...<ApiOptionsComponent>options,
                    componentName: name
                }
                const apiComponent = Engine.createObject('component', componentOpt);
                Engine.setApiComponent([apiComponent]);
                return new Component(name, Engine.getApiComponents());
        }
    }

    getSamples(type: 'entity'): Entity[];
    getSamples(type: 'component'): Component[];
    getSamples(type: EngineObjectType): Entity[] | Component[] {
        if (type === 'entity') {
            return Engine.getApiEntities().filter(e => !!e.sampleId).map(e => new Entity(e.key))
        }
        return Engine.getApiComponents().map((c, index, arr) => new Component(c.componentName, arr));
    }
  
}
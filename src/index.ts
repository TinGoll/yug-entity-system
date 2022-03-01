import Engine from "./engine/Engine";
import {
  EntityOptions,
  ApiEntity,
  NomenclatureCreatorOptions,
  IGetable,
  ApiComponent,
  CreateOptions,
  Components,
  EntityComponent,
  ApiEntityOptions,
  PropertyAttributes,
  PropertyTypes,
  PropertyValue,
} from "./types/entity-types";
import { EntityType } from "./utils/entity-units";

/*

Engine.on('on-component-error', ({ err }) => {
  console.log(err);
  
})

Engine.on('on-entity-error', ( { err } ) => {
  console.log(err);
  
})

console.time('save component-entity');
const engine = new Engine('SERVER');
const creator = engine.nomenclatureCreator()
const entity = creator.create('nomenclature', { signature: { name: 'Тестовая род сущьность' } });
const component = creator.create('component', 'geometry');

component.setComponentDescription('Геометрия')
  .addProperty({ propertyName: 'height', propertyType: 'number', propertyDescription: 'Высота', propertyValue: 916, attributes: 'Вообще что угодно'})

entity.addComponent(component);

component.crateProperty({
  propertyName: 'heigh2t', propertyType: 'number', propertyDescription: 'Высота', propertyValue: 916
}).addAttributes('readonly')



const deleteData = component.preparePropertyForRemoveFromServer('heigh2t')

component.removePropertyByServerData(deleteData);

console.log(component.get());


entity.setProperty('geometry', 'height', 845)

//console.log('result', entity.getPropertyValue('geometry', 'height'));

console.timeEnd('save component-entity');

*/

export default Engine;
export {
  NomenclatureCreatorOptions,
  EntityOptions,
  ApiEntity,
  ApiComponent,
  EntityType,
  IGetable,
  CreateOptions,
  ApiEntityOptions,
  EntityComponent,
  Components,
  PropertyAttributes,
  PropertyTypes,
  PropertyValue
};

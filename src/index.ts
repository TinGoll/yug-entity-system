import Component from "./Component";
import Engine from "./Engine";
import Entity from "./Entity";
import {
  ApiComponent,
  ApiEntity,
  PropertyTypes,
  PropertyValue,
EngineObjectType,
} from "./types/engine-types";
const createEngine = (): Engine => new Engine();

// функция присвоения id 

/*
const save = (apiEntity: ApiEntity[]): ApiEntity[] => {
    let genEntId = 1;
    let genCmpId = 1;
    for (const ent of apiEntity) {
        if (!ent.id) ent.id = genEntId++;
        const parnt = apiEntity.find(e => e.key === ent.parentKey)
        if (parnt) ent.parentId = parnt.id;
        for (const cmp of (ent.components || [])) {
            cmp.id = genCmpId++;
            cmp.entityId = ent.id;
        }
    }
    return apiEntity;
}

const engine = createEngine();
const creator = engine.creator();

const entity = creator.create('entity', 'FATHER', { category: 'Род сущ'});
const entity2 = creator.create('entity', 'SAN');
const entity3 = creator.create('entity', 'VNUCHARA');
const container = creator.create('entity', 'CONTAINER', { category: 'Род сущ', id: 777 });

entity2.addChild(entity3.build());
entity.addChild(entity2.build());

console.log('-------------------------------------');
console.log('BUILD', JSON.stringify(entity.build(), null, 2));
console.log('-------------------------------------');
console.log('CLONE', JSON.stringify(engine.cloneApiEntityBuildData(entity.build()), null, 2));

*/

//container.addChild(entity.build())
/*
const savedApiEntity = save(entity.build())
const [fasad] = engine.loadAndReturning(savedApiEntity);

*/
/*
console.log('********************************************************');
console.log('********************************************************');
console.log('********************************************************');

console.log('CONTAINER', JSON.stringify(container.assemble(), null, 2));

console.log('********************************************************');
console.log('********************************************************');
console.log('********************************************************');
*/
/*

const code = `
    S =  GEOMETRY_HEIGHT_ID1 / 1000 * GEOMETRY_WIDTH_ID1 / 1000 * GEOMETRY_AMOUNT_ID1;
    RESULT = ROUND(S, 3);
`
fasad.setPropertyFormula('geometry', 'square', code); // ПРисваиваем формулу для свойства высота, геометрии

fasad.setPropertyValue('geometry', 'height', 916); // задаем в ручную, свойтсво
fasad.setPropertyValue('geometry', 'width', 396); // задаем в ручную, свойтсво
fasad.setPropertyValue('geometry', 'amount', 1); // задаем в ручную, свойтсво

console.log(fasad.getPropertyValue('geometry', 'square')); // получаем результат работы формулы
*/

/*
const component = creator.create('component', 'geometry', { componentDescription: "Геометрия"})
    .addProperty({ propertyName: 'height', propertyType: 'number', propertyDescription: "высота" })
    .addProperty({ propertyName: 'width', propertyType: 'number', propertyDescription: "ширина" })
    .addProperty({ propertyName: 'amount', propertyType: 'number', propertyDescription: "кол-во" })
    .addProperty({ propertyName: 'square', propertyType: 'number', propertyDescription: "площадь" });

const money = creator.create('component', 'money', {componentDescription: "Деньги"})
    .addProperty({ propertyName: 'price', propertyDescription: 'Цена', propertyValue: 0 })
    .addProperty({ propertyName: 'cost', propertyDescription: 'Стоимость', propertyValue: 0 })
*/

export default createEngine;
export {
  Engine,
  Entity,
  Component,
  ApiComponent,
  ApiEntity,
  PropertyTypes,
  PropertyValue,
  EngineObjectType
};

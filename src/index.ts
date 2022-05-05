import Component from "./Component";
import Engine from "./Engine";
import Entity from "./Entity";
import {
  ApiComponent,
  ApiEntity,
  PropertyTypes,
  PropertyValue,
  EngineObjectType,
  PropertyAttribute,
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

console.time('FirstWay');

const engine = createEngine();
const creator = engine.creator();

const money = creator.create('component', 'money', { componentDescription: "Деньги" })
  .addProperty({ propertyName: 'price', propertyDescription: 'Цена', propertyValue: 1000, propertyType: 'number', attributes: "required;" });
const color = creator.create('component', 'finishing', { componentDescription: 'Цвет' })
  .addProperty({ propertyName: 'color', propertyDescription: 'Цвет', propertyValue: 'Красный', propertyType: 'string', attributes: "show;required;"})

const entity = creator.create('entity', 'БАТЯ', { category: 'Род сущ', note: 'Главный' }).addComponent(money).addComponent(color);
const entity2 = creator.create('entity', 'СЫН', { note: 'Средний', }).addComponent(money);
const entity3 = creator.create('entity', 'ВНУЧА', { note: 'Младшая' }).addComponent(money);

const entity4 = creator.create('entity', 'ДЯДЯ', { note: 'Дальний' }).addComponent(money);

entity2.addChild(entity3.build());
entity.addChild(entity2.build());


const saveData = save(entity.build());

const [fasad] = engine.loadAndReturning(saveData);
const [cld1] = fasad.getChildren();
const [cld2] = cld1.getChildren();

fasad.resetСheckСhanges()


// Изначальная цена у всех сущностей 1000.
// Формула фасада
fasad.setPropertyFormula('money', 'price', `
    A = THIS;
    RESULT = A * 2;
`);

// Формула филенки
cld1.setPropertyFormula('money', 'price', `
    A = GF_PRICE();
    C = THIS;
    RESULT = A + C;
`);
// Формула рубашки, с последующим вычислением.
// Далее по цепи, что бы вычислить стоимость,  вычисляется стоимость филенки, 
// которая провоцирует вычисление фасада и результат выводиться в лог

const res =  cld2.setPropertyFormula('money', 'price', `
      A = GF_PRICE();
      B = F_PRICE();
      C = THIS;
      RESULT = RUB(A + B + C)
`);

//console.log(fasad.getApiComponents()[0]);

fasad.resetСheckСhanges();

console.log("очистка");

console.log(fasad.getChangedComponents());

fasad.setPropertyValueToKey(fasad.getApiComponents()[0].key, 100500);

console.log(fasad.getChangedEntities());


console.timeEnd('FirstWay');

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
  EngineObjectType,
  PropertyAttribute
};

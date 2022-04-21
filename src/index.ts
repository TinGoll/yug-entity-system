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

console.time('FirstWay');


const engine = createEngine();
const creator = engine.creator();

const money = creator.create('component', 'money', { componentDescription: "Деньги" })
  .addProperty({ propertyName: 'price', propertyDescription: 'Цена', propertyValue: 1000, propertyType: 'number' });
const color = creator.create('component', 'finishing', { componentDescription: 'Цвет' })
  .addProperty({propertyName: 'color', propertyDescription: 'Цвет', propertyValue: 'Красный', propertyType: 'string'})

const entity = creator.create('entity', 'БАТЯ', { category: 'Род сущ', note: 'Главный' }).addComponent(money).addComponent(color);
const entity2 = creator.create('entity', 'СЫН', { note: 'Средний', }).addComponent(money);
const entity3 = creator.create('entity', 'ВНУЧА', { note: 'Младшая' }).addComponent(money);

const container = creator.create('entity', 'CONTAINER', { category: 'Род сущ', id: 777 }).addComponent(money);

entity2.addChild(entity3.build());
entity.addChild(entity2.build());
entity.addChild(entity2.build());
entity.addChild(entity2.build());
//entity.addChild(entity2.build());
//entity.addChild(entity2.build());


const saveData = save(entity.build());

const [fasad] = engine.loadAndReturning(saveData);
const [cld1] = fasad.getChildrens();
const [cld2] = cld1.getChildrens();

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

console.timeEnd('FirstWay');

console.log(cld2.getPropertyValue("money", "price"));


//console.log(cld2.name, JSON.stringify(cld2.getPreparationData(cld2.getApiComponents()[0].key), null, 2));


//console.log((fasad.build().map(e => ({name: e.name, note: e.note}))));

*/



//.getPropertyValue('money', 'price');

//console.log(JSON.stringify(cld2.getPreparationData(cld2.getComponents()[0].build()[0].key).clientButtons, null, 2));

//************************************************************ */
//const GETAGGREGATOR = fasad.getterExecutor<number>('money', 'price')
//const SETAGGREGATOR = fasad.setterExecutor<number>('money', 'price')

/** Значение price в комопненте фасада равно 1000 */
//console.log('Результат работы геттера:', GETAGGREGATOR());

// Теперь сеттер
//SETAGGREGATOR(580)

//console.log('Результат работы геттера:', GETAGGREGATOR());

//aggregator


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

import Engine from "./engine/Engine";

/** Шапка с компонентом отделка */
const header = Engine.create({
    entity:{
        typeId: 1,
        name: 'Шапка'
    },
    components: {
        finishingComponent: {
            colorId: 1,
            patinaId: 2,
            varnishId: 3
        }
    }
});

const entity2 = Engine.create({
    entity: {
        typeId: 3,
        name: 'Глухой'
    },
    components: {
        geometryComponent: {
            height: 0,
            width: 0,
            depth: 20,
            amount: 0
        },
        priceComponent: {
            price: 1000
        },
        finishingComponent: {
            patinaId: 0
        }
    }
});

const entity = header.produce({
    entity: {
        name: 'Фасад'
    },
    components: {
        finishingComponent: {
            colorId: 5
        },
        geometryComponent: {
            height: 1000,
            width: 500
        }
    }
})

console.log(entity.getOptions());
//console.log('--------------------------------------------');
//console.log(header.override(entity2).getOptions());
//console.log('--------------------------------------------');

console.log('--------------------------------------------');

Engine.integration(entity.getOptions(), entity2.getOptions());

console.log(entity.getOptions());

const engine = new Engine();

engine.destroy();

/** конец */
//console.log(header.getOptions());
//console.log(header.validate());


//console.log(entity.getOptions());

export {
    Engine
}

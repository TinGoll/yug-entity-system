import { Entity } from "../Models/entities/Entity";
import { ComponentTuple, ApiComponent, PropertyValue, FormulaPropertyButtons, IKeysMap } from "../types/entity-types";

interface FormulaComponents { entityName: string, key: string, id: number, components: ApiComponent[], count: number }
interface IFactory {
    CMP: (componentTuple: ComponentTuple) => PropertyValue | null;
    BUTTONS: IButtons [];
}
interface IButtons {
    GROUP: string;
    COM_DESC: string;
    NAME: string;
    VALUE: string;
    TUPLE: ComponentTuple;
    CODE: string;
}

export function formulaExecutor(this: Entity, code: string, type: 'execution' | 'preparation' = 'execution') {
    try {
        /************************************************************************************************************************** */
        const propertiesSet = new Map<string, FormulaPropertyButtons>();
        const propertyVariable = new Map<string, ComponentTuple[]>();

        const ME = this as Entity;
        const NAME = ME.getName();
        const FATHER = ME?.getParent();
        const CHILDS = ME?.getChildren() || [];
        const BROTHERS = FATHER?.getChildren() || [];
        const GRAND_FATHER = GET_GRAND_FATHER(FATHER);

        const FACS = new Map<string, IFactory>();

        for (const fComp of GET_COMPONENTS(GRAND_FATHER || ME)) {
            /** Подготовка кнопок для использования на клиенте. */
            //.replace(/[^a-z]/g, '')
            const CMP = cmp_factory(fComp.components);
            const BUTTONS = fComp.components.map(component => {
                const GROUP = `${fComp.entityName} inx: ${fComp.count}`;
                const COM_DESC = `${component.componentDescription}`
                const NAME  = `${component.propertyDescription} [${fComp.count}]`;
                //const VALUE = `${component.propertyName.toUpperCase()}_I${fComp.count}`; // Вариант более осмысленного названия.
                //const VALUE = `VAR_ID${component.id || (component.key.split(':')[1]?.slice(0, 8))}`; // Привязка к ID или ключу.
                const VALUE = `VAR_${component.propertyName.toUpperCase()}_${component.componentName.toUpperCase()}_ID${fComp.id}`; // Привязка к ID или ключу.
                const TUPLE = <ComponentTuple>[component.componentName!, component.propertyName!];
                const CODE  = `const ${VALUE} = FACS.get('${fComp.entityName} inx: ${fComp.count}')?.CMP(['${TUPLE[0]}', '${TUPLE[1]}']);`;
                return { GROUP, COM_DESC, NAME, VALUE, TUPLE, CODE};
            });
            /** Сборка элемента экзекутора */
            const factoryElement: IFactory = {CMP, BUTTONS};
            FACS.set(`${fComp.entityName} inx: ${fComp.count}`, factoryElement);
        }
  
        /************************************************************************************************************************** */
        /**
         * Функция формирования массива компонетов с привязкой владельцу.
         * @param object Сущьность, комопнеты которой попадут в массив, а так же компоненты потомков. 
         * @returns FormulaComponents [];
         */
        function GET_COMPONENTS(object: Entity | undefined, count: number = 0): FormulaComponents[] {
            const objs: FormulaComponents[] = [];
            if (!object) return objs;
            count++;
            objs.push({ entityName: object?.name || '', key: object.key, id: object.getId(),   components: object?.getComponents()||[], count});
            for (const ent of (object?.getChildren()||[])) {
                objs.push(...GET_COMPONENTS(ent, count));
            }
            return objs;
        }
        /**
         * Функция возвращает наивысшую сущность в независимости от положения курсора.
         * @param father - родительская сущность.
         * @returns Наивысшую сущность.
         */
        function GET_GRAND_FATHER(father: Entity | undefined): Entity | undefined {
            if (!father) return;
            return GET_GRAND_FATHER(father.getParent()) || father;
        }
        /**
         * Создает функцию, которая возвращает значение любого компонента, так же выполняет формулу, 
         * если такая есть в свойстве.
         * @param components Комопненты сущности.
         * @returns значение или null
         */
        function cmp_factory(components: ApiComponent[]) {
            return function CMP(componentTuple: ComponentTuple): PropertyValue | null {
                try {
                    const cmps = components;
                    const cmp = cmps.find(c => c.componentName === componentTuple[0] && c.propertyName === componentTuple[1]);
                    if (!cmp) return null;
                    const type = cmp.propertyType;
                    if (type === 'number') return Number(cmp.propertyValue);
                    if (type === 'boolean') return Boolean(cmp.propertyValue);
                    if (type === 'date') return new Date(String(cmp.propertyValue));
                    if (type === 'string') return String(cmp.propertyValue);
                    return cmp.propertyValue;
                } catch (e) {return null;}
            }
        }
        /************************************************************************************************************************** */

        //const MCMP = cmp_factory(M_COMPONENTS);
        //const FCMP = cmp_factory(F_COMPONENTS);

        const arrCodeVar: string[] = [];
        for (const fac of FACS.values()) {
            for (const but of fac.BUTTONS) {
                arrCodeVar.push(but.CODE);
           }
        }

        const baseCode = `
        const executor = () => {
                ${arrCodeVar.join('\n')}
                let RESULT = null; // Результат
                ${code}
                return RESULT;
        }
        executor();
        `;
        console.log(baseCode);
        
        if (type === 'execution') return eval(baseCode);
        const clientButtons: any[] = [];
        for (const F of FACS) {
            const compNames = [...new Set(F[1].BUTTONS.map(b => b.COM_DESC))];
            const tempArr: any [] = [];
            for (const cname of compNames) {
                const buttons = F[1].BUTTONS.filter(b => b.COM_DESC === cname)
                    .map(b=> {
                        return {
                            name: b.NAME,
                            value: b.VALUE,
                        }
                    })
                tempArr.push({componentName: cname, buttons});
            }
            const but = {
                group: F[0],
                components: [...tempArr]
            }
            clientButtons.push(but)
        }

        let startCode = '';
        startCode += `/*************************************************************/\n`;
        startCode += `/*  ME - Текущий объект, FATHER - родитель,                  */\n`;
        startCode += `/*  CHILDS - детки, BROTHERS - братья, GRAND_FATHER - дед    */\n`;
        startCode += `/*  RESULT - в эту переменную внесите результат.             */\n`;
        startCode += `/*  Остальное в кнопках на панели                            */\n`;
        startCode += `/*************************************************************/\n`;
        startCode += `// Тут пишите ваш код, удачи!\n\n\n`;

        return {clientButtons, startCode};
    } catch (e) {
        console.log(e);
        return null;
    }
}

function strtr(str: string): string {
    let txt = str.toLowerCase();
    const trans: IKeysMap = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
        'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i',
        'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
        'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
        'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch',
        'ш': 'sh', 'щ': 'sch', 'ь': '', 'ы': 'y', 'ъ': '',
        'э': 'e', 'ю': 'yu', 'я': 'ya'};
    for (var i = 0; i < txt.length; i++) {
        var f = txt.charAt(i),
            r = trans[f];
        if (r) {
            txt = txt.replace(new RegExp(f, 'g'), r);
        }
    }
    return txt.replace(/[\s.,%]/g, '').toUpperCase();
}


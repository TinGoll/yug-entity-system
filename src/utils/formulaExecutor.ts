import { Engine } from "../engine/Engine";
import { Entity } from "../Models/entities/Entity";
import { ComponentTuple, ApiComponent, PropertyValue, FormulaPropertySet, IKeysMap } from "../types/entity-types";

interface FormulaComponents { entityName: string, key: string, components: ApiComponent[], count: number }

export function formulaExecutor(this: Entity, code: string, type: 'execution' | 'preparation' = 'execution') {
    try {
        /************************************************************************************************************************** */
        const propertiesSet = new Map<string, FormulaPropertySet>();
        const propertyVariable = new Map<string, ComponentTuple[]>();

        const ME = this as Entity;
        const NAME = ME.getName();
        const FATHER = ME?.getParent();
        const CHILDS = ME?.getChildren() || [];
        const BROTHERS = FATHER?.getChildren() || [];
        const GRAND_FATHER = GET_GRAND_FATHER(FATHER);

        const M_COMPONENTS = ME?.getComponents() || [];
        const F_COMPONENTS = FATHER?.getComponents() || [];
        
        const m_comp_names: ComponentTuple[] = [...<ComponentTuple[]>(M_COMPONENTS.map(c => ([c.componentName!, c.propertyName!])))];
        const f_comp_names: ComponentTuple[] = [...<ComponentTuple[]>(F_COMPONENTS.map(c => ([c.componentName!, c.propertyName!])))];

        for (const fComp of GET_COMPONENTS(GRAND_FATHER || ME)) {
            const factory = cmp_factory(fComp.components);
            /** Подготовка кнопок для использования на клиенте. */
            for (const component of fComp.components) {
                const formulaElement = {}
                
            }

            /** Подготовка кнопок для использования на клиенте. */
            propertiesSet.set(`${fComp.entityName}[${fComp.count}]`, {
                group: `${fComp.entityName}[${fComp.count}]`,
                buttons: [
                    ...(fComp.components || []).map(c => {
                        const ps: { compName: string; name: string; value: string } = {
                            name: `${c.propertyDescription} ${fComp.entityName}[${fComp.count}]`,
                            value: `${strtr(fComp.entityName.split(' ').map(a => a.slice(0, 3)).join('_'))}_${fComp.count}_${c.propertyName.toUpperCase()}`,
                            compName: c.componentName
                        }
                        return ps;
                     })
                ]
            });
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
            objs.push({ entityName: object?.name || '', key: object.key, components: object?.getComponents()||[], count});
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

        const MCMP = cmp_factory(M_COMPONENTS);
        const FCMP = cmp_factory(F_COMPONENTS);

        const baseCode = `
        const executor = () => {
                /************************************************/
                const M_HEIGHT = MCMP(['geometry', 'height'])
                const M_WIDTH = MCMP(['geometry', 'width'])
                const M_AMOUNT = MCMP(['geometry', 'amount']) 
                /************************************************/
                const F_HEIGHT = FCMP(['geometry', 'height'])
                const F_WIDTH = FCMP(['geometry', 'width'])
                const F_AMOUNT = FCMP(['geometry', 'amount']) 
                /************************************************/
                let RESULT = null; // Результат
                ${code}
                return RESULT;
        }
        executor();
        `;
        if (type === 'execution') return eval(baseCode);
        return [...propertiesSet.values()]
    } catch (e) {
        return null;
    }
}

function strtr(str: string) {
    let txt = str.toLowerCase().replace(/[^a-z]/g, '');
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


import { PropertyAttribute } from "../@engine-types";

export default class AttributeCreator {
    private attributes: PropertyAttribute[] = [];
    constructor(...att: PropertyAttribute[]) {
        this.createAttributes(...att)
    }
    createAttributes(...attribute: PropertyAttribute[]): this {
        this.attributes = [...new Set([...this.attributes, ...attribute
            .map(a => <PropertyAttribute>a.replace(/\s/g, ''))])]
        return this;
    }
    addAsString (str: string) {
        this.createAttributes(...(str.split(";") as PropertyAttribute[]))
    }
    toString (): string {
        return this.attributes.join(";");
    }
    values(): { attributes: string | undefined} {
        return {
            attributes: this.toString() || undefined
        }
    }

    [Symbol.iterator] () {
        function* sequence(att: { attributes: string | undefined }): Generator<{ attributes: string | undefined }, { attributes: string | undefined }> {
            yield {...att}
            return att;
        }
        return sequence(this.values())
    };
}
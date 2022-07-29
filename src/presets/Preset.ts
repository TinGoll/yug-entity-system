import { ApiComponent } from "../@engine-types";
import { work_json } from "./json/work-data";
import { PresetRoot } from "./types";

export class Preset {
  private map: Map<keyof PresetRoot, string>;

  constructor() {
    this.map = new Map([["work", work_json]]);
  }

  get(categoryName: keyof PresetRoot): ApiComponent[] | null {
    try {
      if (!this.map.has(categoryName)) return null;
      const obj = JSON.parse(this.map.get(categoryName)!);
      return <ApiComponent[]>obj;
    } catch (e) {
      return null;
    }
  }
}

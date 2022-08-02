import Engine from "..";
import { ApiComponent } from "../@engine-types";
import { work_json } from "./json/work-data";
import { PresetRoot } from "./types";

export class Preset {
  private map: Map<keyof PresetRoot, string>;
  private engine: Engine;
  constructor(engine: Engine) {
    this.engine = engine;
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

  getRegisteredComponents(categoryName: keyof PresetRoot): ApiComponent[] | null {
    try {
      const cmps = this.get(categoryName);
      if (!cmps) return null;
      return cmps.map((c) => this.engine.registration<ApiComponent>(c));
    } catch (e) {
      return null;
    }
  }
}

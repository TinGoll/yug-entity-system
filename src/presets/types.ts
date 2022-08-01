declare interface Geometry {
  height: number;
  width: number;
  depth: number;
  amount: number;
  square: number;
  cubature: number;
  linearMeters: number;
}

declare interface Work {
  name: string;
  price: number;
  cost: number;
  weight: number;
  sector: string;
}

declare type PresetComponentList = Geometry | Work;

export declare interface PresetRoot {
  geometry: Geometry;
  work: Work;
}

export declare type PresetComponent<T extends PresetComponentList> = {
  [key in keyof T]: T[keyof T];
};

// const test: PresetComponents<Geometry> = {
//   amount: 10,
//   height: 0,
//   width: 0,
//   depth: 0,
//   square: 0,
//   cubature: 0,
//   linearMeters: 0,
// };

// const testF = <T extends keyof CMP>(
//   name: T,
//   prob: keyof PresetComponents<CMP[T]>
// ) => {
//   return;
// };

// testF<"geometry">("geometry", "cubature");

export interface Mortal {
  id: string;
  name: string;
  trait: "skeptical" | "zealous" | "cautious";
}

export interface RunResources {
  belief: number;
  influence: number;
  veil: number;
}

export interface GameState {
  resources: RunResources;
  mortals: Mortal[];
  prophets: number;
}

export const initialGameState: GameState = {
  resources: {
    belief: 0,
    influence: 100,
    veil: 100
  },
  mortals: [
    {
      id: "mortal-1",
      name: "Ilyr of the Hollow",
      trait: "cautious"
    }
  ],
  prophets: 0
};


export type Candidate = {
  number: string;
  name: string;
  party: string;
  photo: string;
};

export const candidates: Record<string, Candidate> = {
  "13": {
    number: "13",
    name: "LULA",
    party: "PT",
    photo: "/candidatos/lula.jpg",
  },
  "14": {
    number: "14",
    name: "RENAN SANTOS",
    party: "MISSÃO",
    photo: "/candidatos/renan-santos.jpg",
  },
  "22": {
    number: "22",
    name: "FLÁVIO BOLSONARO",
    party: "PL",
    photo: "/candidatos/flavio-bolsonaro.jpg",
  },
  "27": {
    number: "27",
    name: "CLARIANA BARÃO",
    party: "DC",
    photo: "/candidatos/clariana.jpg",
  },
  "28": {
    number: "28",
    name: "LEONARDO AVALANCHE",
    party: "PRTB",
    photo: "/candidatos/avalanche.jpg",
  },
  "30": {
    number: "30",
    name: "ZEMA",
    party: "NOVO",
    photo: "/candidatos/zema.jpg",
  },
  "55": {
    number: "55",
    name: "RONALDO CAIADO",
    party: "PSD",
    photo: "/candidatos/caiado.jpg",
  },
};

export const lulaSurpresa: Candidate = {
  number: "13",
  name: "LULA",
  party: "PT",
  photo: "/candidatos/lula-chapeuzinho.jpg",
};

export const DIGIT_COUNT = 2;

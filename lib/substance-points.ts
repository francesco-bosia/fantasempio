export const substancePoints = {
    Snus: 0.5,
    Sigaretta: 1,
    Cannabis: 1,
    "Cerotto alla nicotina": 5,
    "Birra 3dl": -0.5,
    "Birra 5dl": 4,
    "Birra analcolica": -0.5,
    "Bicchiere di vino": 3,
    Cocktail: 5,
    Shot: 4,
    "Fast food": 3,
    LSD: 10,
    "Droghe pesanti": 100,
    "Clean sheet": -3,
  }
  
  export type SubstanceType = keyof typeof substancePoints
  
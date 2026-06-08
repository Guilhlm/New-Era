type Per100g = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export function scaleMacrosFrom100g(per100g: Per100g, grams: number) {
  const factor = grams / 100;
  return {
    calories: Math.round(per100g.calories * factor),
    protein: round1(per100g.protein * factor),
    carbodrate: round1(per100g.carbs * factor),
    fats: round1(per100g.fats * factor),
  };
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

export const FOOD_CATEGORIES = [
  "Carnes y aves",
  "Pescados y mariscos",
  "Huevos",
  "Lácteos",
  "Cereales y derivados",
  "Legumbres",
  "Verduras",
  "Frutas",
  "Frutos secos y semillas",
  "Grasas y aceites",
  "Azúcares y dulces",
  "Productos envasados",
  "Bebidas",
] as const;

export type FoodCategory = (typeof FOOD_CATEGORIES)[number];

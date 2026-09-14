import { createFoodItem } from "./service";
import { prisma } from "@/lib/prisma";
import type { FoodInput } from "./schema";

/**
 * Dataset inicial de alimentos comunes en Argentina.
 *
 * IMPORTANTE: estos son valores de referencia (compilados a partir de tablas
 * de composición de alimentos de uso general), NO una transcripción literal
 * verificada contra SARA 2 o el Buscador Nutricional de ANMAT. `sourceDetail`
 * lo deja explícito en cada fila. Antes de usarlos con un paciente real,
 * verificalos y corregilos desde el panel de administración (/admin/alimentos):
 * cada corrección queda versionada y no se pierde el valor anterior.
 */
const SARA2_NOTE = "Valor de referencia a verificar contra SARA 2 (ENNyS).";
const ANMAT_NOTE = "Valor de referencia genérico a verificar contra el Buscador Nutricional de ANMAT.";

export const seedFoodsData: FoodInput[] = [
  // --- Carnes y aves ---
  { name: "Pechuga de pollo, cruda", category: "Carnes y aves", state: "RAW", kcalPer100g: 120, proteinPer100g: 22.5, fatPer100g: 2.6, carbPer100g: 0, householdUnitName: "1 pechuga mediana", householdUnitGrams: 150, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Pechuga de pollo, cocida", category: "Carnes y aves", state: "COOKED", kcalPer100g: 165, proteinPer100g: 31, fatPer100g: 3.6, carbPer100g: 0, householdUnitName: "1 pechuga mediana", householdUnitGrams: 120, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Muslo de pollo con piel, crudo", category: "Carnes y aves", state: "RAW", kcalPer100g: 233, proteinPer100g: 17, fatPer100g: 18, carbPer100g: 0, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Muslo de pollo, cocido", category: "Carnes y aves", state: "COOKED", kcalPer100g: 250, proteinPer100g: 26, fatPer100g: 16, carbPer100g: 0, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Carne vacuna (nalga), cruda", category: "Carnes y aves", state: "RAW", kcalPer100g: 137, proteinPer100g: 21.6, fatPer100g: 5.4, carbPer100g: 0, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Carne vacuna (nalga), cocida", category: "Carnes y aves", state: "COOKED", kcalPer100g: 184, proteinPer100g: 28, fatPer100g: 7.6, carbPer100g: 0, householdUnitName: "1 bife mediano", householdUnitGrams: 150, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Carne picada común, cruda", category: "Carnes y aves", state: "RAW", kcalPer100g: 219, proteinPer100g: 17.2, fatPer100g: 16.2, carbPer100g: 0, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Carne picada común, cocida", category: "Carnes y aves", state: "COOKED", kcalPer100g: 254, proteinPer100g: 25.3, fatPer100g: 16.9, carbPer100g: 0, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Bife de chorizo, crudo", category: "Carnes y aves", state: "RAW", kcalPer100g: 220, proteinPer100g: 20, fatPer100g: 15, carbPer100g: 0, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Bondiola de cerdo, cruda", category: "Carnes y aves", state: "RAW", kcalPer100g: 143, proteinPer100g: 20, fatPer100g: 6.8, carbPer100g: 0, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Hígado vacuno, cocido", category: "Carnes y aves", state: "COOKED", kcalPer100g: 165, proteinPer100g: 26, fatPer100g: 4.9, carbPer100g: 3.9, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Jamón cocido", category: "Carnes y aves", state: "NA", kcalPer100g: 120, proteinPer100g: 18, fatPer100g: 4, carbPer100g: 2, sodiumMgPer100g: 1050, householdUnitName: "1 feta", householdUnitGrams: 25, source: "ANMAT", sourceDetail: ANMAT_NOTE , suitableBreakfast: true, suitableMainMeal: false},

  // --- Pescados y mariscos ---
  { name: "Merluza, cruda", category: "Pescados y mariscos", state: "RAW", kcalPer100g: 86, proteinPer100g: 17.7, fatPer100g: 1.3, carbPer100g: 0, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Merluza, cocida", category: "Pescados y mariscos", state: "COOKED", kcalPer100g: 112, proteinPer100g: 23, fatPer100g: 1.7, carbPer100g: 0, householdUnitName: "1 filete", householdUnitGrams: 130, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Atún fresco, crudo", category: "Pescados y mariscos", state: "RAW", kcalPer100g: 130, proteinPer100g: 23.3, fatPer100g: 4.1, carbPer100g: 0, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Atún al natural, en lata (escurrido)", category: "Pescados y mariscos", state: "NA", kcalPer100g: 116, proteinPer100g: 26, fatPer100g: 1, carbPer100g: 0, sodiumMgPer100g: 300, householdUnitName: "1 lata chica", householdUnitGrams: 120, source: "ANMAT", sourceDetail: ANMAT_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Salmón, crudo", category: "Pescados y mariscos", state: "RAW", kcalPer100g: 208, proteinPer100g: 20, fatPer100g: 13, carbPer100g: 0, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Camarones, cocidos", category: "Pescados y mariscos", state: "COOKED", kcalPer100g: 99, proteinPer100g: 24, fatPer100g: 0.3, carbPer100g: 0.2, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},

  // --- Huevos ---
  { name: "Huevo entero, crudo", category: "Huevos", state: "RAW", kcalPer100g: 143, proteinPer100g: 12.6, fatPer100g: 9.5, carbPer100g: 0.7, householdUnitName: "1 huevo grande", householdUnitGrams: 50, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: true, suitableMainMeal: true},
  { name: "Huevo entero, cocido (duro)", category: "Huevos", state: "COOKED", kcalPer100g: 155, proteinPer100g: 12.6, fatPer100g: 10.6, carbPer100g: 1.1, householdUnitName: "1 huevo grande", householdUnitGrams: 50, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: true, suitableMainMeal: true},
  { name: "Clara de huevo, cruda", category: "Huevos", state: "RAW", kcalPer100g: 52, proteinPer100g: 10.9, fatPer100g: 0.2, carbPer100g: 0.7, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: true, suitableMainMeal: true},

  // --- Lácteos ---
  { name: "Leche entera", category: "Lácteos", state: "NA", kcalPer100g: 61, proteinPer100g: 3.2, fatPer100g: 3.3, carbPer100g: 4.8, sodiumMgPer100g: 44, householdUnitName: "1 taza", householdUnitGrams: 240, source: "ANMAT", sourceDetail: ANMAT_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Leche descremada", category: "Lácteos", state: "NA", kcalPer100g: 34, proteinPer100g: 3.4, fatPer100g: 0.1, carbPer100g: 5, sodiumMgPer100g: 45, householdUnitName: "1 taza", householdUnitGrams: 240, source: "ANMAT", sourceDetail: ANMAT_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Yogur natural entero", category: "Lácteos", state: "NA", kcalPer100g: 61, proteinPer100g: 3.5, fatPer100g: 3.3, carbPer100g: 4.7, sodiumMgPer100g: 46, householdUnitName: "1 pote", householdUnitGrams: 200, source: "ANMAT", sourceDetail: ANMAT_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Yogur natural descremado", category: "Lácteos", state: "NA", kcalPer100g: 41, proteinPer100g: 4, fatPer100g: 0.2, carbPer100g: 5.9, sodiumMgPer100g: 52, householdUnitName: "1 pote", householdUnitGrams: 200, source: "ANMAT", sourceDetail: ANMAT_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Queso cremoso", category: "Lácteos", state: "NA", kcalPer100g: 292, proteinPer100g: 16, fatPer100g: 25, carbPer100g: 2, sodiumMgPer100g: 560, householdUnitName: "1 feta", householdUnitGrams: 30, source: "ANMAT", sourceDetail: ANMAT_NOTE , suitableBreakfast: true, suitableMainMeal: true},
  { name: "Queso fresco tipo mozzarella", category: "Lácteos", state: "NA", kcalPer100g: 280, proteinPer100g: 22, fatPer100g: 21, carbPer100g: 2, sodiumMgPer100g: 373, householdUnitName: "1 feta", householdUnitGrams: 30, source: "ANMAT", sourceDetail: ANMAT_NOTE , suitableBreakfast: true, suitableMainMeal: true},
  { name: "Queso untable descremado", category: "Lácteos", state: "NA", kcalPer100g: 105, proteinPer100g: 8, fatPer100g: 5, carbPer100g: 6, sodiumMgPer100g: 400, householdUnitName: "1 cda", householdUnitGrams: 20, source: "ANMAT", sourceDetail: ANMAT_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Ricota", category: "Lácteos", state: "NA", kcalPer100g: 174, proteinPer100g: 11, fatPer100g: 13, carbPer100g: 3, sodiumMgPer100g: 84, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: true, suitableMainMeal: true},
  { name: "Queso rallado tipo reggianito", category: "Lácteos", state: "NA", kcalPer100g: 400, proteinPer100g: 34, fatPer100g: 28, carbPer100g: 1, sodiumMgPer100g: 1200, householdUnitName: "1 cda", householdUnitGrams: 10, source: "ANMAT", sourceDetail: ANMAT_NOTE , suitableBreakfast: false, suitableMainMeal: true},

  // --- Cereales y derivados ---
  { name: "Arroz blanco, crudo", category: "Cereales y derivados", state: "RAW", kcalPer100g: 365, proteinPer100g: 7.1, fatPer100g: 0.7, carbPer100g: 79.3, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Arroz blanco, cocido", category: "Cereales y derivados", state: "COOKED", kcalPer100g: 130, proteinPer100g: 2.7, fatPer100g: 0.3, carbPer100g: 28.2, householdUnitName: "1 taza", householdUnitGrams: 180, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Fideos secos, crudos", category: "Cereales y derivados", state: "RAW", kcalPer100g: 371, proteinPer100g: 13, fatPer100g: 1.5, carbPer100g: 74.7, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Fideos, cocidos", category: "Cereales y derivados", state: "COOKED", kcalPer100g: 158, proteinPer100g: 5.8, fatPer100g: 0.9, carbPer100g: 30.9, householdUnitName: "1 taza", householdUnitGrams: 200, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Pan francés", category: "Cereales y derivados", state: "NA", kcalPer100g: 270, proteinPer100g: 8.5, fatPer100g: 1.5, carbPer100g: 55, sodiumMgPer100g: 540, householdUnitName: "1 unidad chica", householdUnitGrams: 50, source: "ANMAT", sourceDetail: ANMAT_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Pan lactal blanco", category: "Cereales y derivados", state: "NA", kcalPer100g: 250, proteinPer100g: 8, fatPer100g: 3, carbPer100g: 48, sodiumMgPer100g: 480, householdUnitName: "1 rebanada", householdUnitGrams: 25, source: "ANMAT", sourceDetail: ANMAT_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Avena arrollada, cruda", category: "Cereales y derivados", state: "RAW", kcalPer100g: 389, proteinPer100g: 16.9, fatPer100g: 6.9, carbPer100g: 66.3, householdUnitName: "1 taza", householdUnitGrams: 90, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Harina de trigo 0000", category: "Cereales y derivados", state: "RAW", kcalPer100g: 354, proteinPer100g: 10, fatPer100g: 1, carbPer100g: 74.5, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: true, suitableMainMeal: true},
  { name: "Polenta (harina de maíz), cruda", category: "Cereales y derivados", state: "RAW", kcalPer100g: 361, proteinPer100g: 8.1, fatPer100g: 1.5, carbPer100g: 77, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Polenta, cocida", category: "Cereales y derivados", state: "COOKED", kcalPer100g: 85, proteinPer100g: 2, fatPer100g: 0.4, carbPer100g: 18, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},

  // --- Legumbres ---
  { name: "Lentejas, crudas", category: "Legumbres", state: "RAW", kcalPer100g: 353, proteinPer100g: 25.8, fatPer100g: 1.1, carbPer100g: 60.1, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Lentejas, cocidas", category: "Legumbres", state: "COOKED", kcalPer100g: 116, proteinPer100g: 9, fatPer100g: 0.4, carbPer100g: 20, householdUnitName: "1 pocillo", householdUnitGrams: 100, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Garbanzos, cocidos", category: "Legumbres", state: "COOKED", kcalPer100g: 164, proteinPer100g: 8.9, fatPer100g: 2.6, carbPer100g: 27.4, householdUnitName: "1 pocillo", householdUnitGrams: 100, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Porotos negros, cocidos", category: "Legumbres", state: "COOKED", kcalPer100g: 132, proteinPer100g: 8.9, fatPer100g: 0.5, carbPer100g: 23.7, householdUnitName: "1 pocillo", householdUnitGrams: 100, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Arvejas, cocidas", category: "Legumbres", state: "COOKED", kcalPer100g: 84, proteinPer100g: 5.4, fatPer100g: 0.4, carbPer100g: 15.6, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},

  // --- Verduras ---
  { name: "Papa, cruda", category: "Verduras", state: "RAW", kcalPer100g: 77, proteinPer100g: 2, fatPer100g: 0.1, carbPer100g: 17, householdUnitName: "1 papa mediana", householdUnitGrams: 150, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Papa, cocida (hervida)", category: "Verduras", state: "COOKED", kcalPer100g: 87, proteinPer100g: 1.9, fatPer100g: 0.1, carbPer100g: 20.1, householdUnitName: "1 papa mediana", householdUnitGrams: 150, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Batata, cocida", category: "Verduras", state: "COOKED", kcalPer100g: 90, proteinPer100g: 2, fatPer100g: 0.1, carbPer100g: 20.7, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Zanahoria, cruda", category: "Verduras", state: "RAW", kcalPer100g: 41, proteinPer100g: 0.9, fatPer100g: 0.2, carbPer100g: 9.6, householdUnitName: "1 unidad", householdUnitGrams: 70, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Tomate, crudo", category: "Verduras", state: "RAW", kcalPer100g: 18, proteinPer100g: 0.9, fatPer100g: 0.2, carbPer100g: 3.9, householdUnitName: "1 unidad mediana", householdUnitGrams: 120, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Lechuga", category: "Verduras", state: "RAW", kcalPer100g: 15, proteinPer100g: 1.4, fatPer100g: 0.2, carbPer100g: 2.9, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Cebolla, cruda", category: "Verduras", state: "RAW", kcalPer100g: 40, proteinPer100g: 1.1, fatPer100g: 0.1, carbPer100g: 9.3, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Zapallo, cocido", category: "Verduras", state: "COOKED", kcalPer100g: 26, proteinPer100g: 1, fatPer100g: 0.1, carbPer100g: 6.5, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Zapallito, crudo", category: "Verduras", state: "RAW", kcalPer100g: 17, proteinPer100g: 1.2, fatPer100g: 0.3, carbPer100g: 3.1, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Brócoli, cocido", category: "Verduras", state: "COOKED", kcalPer100g: 35, proteinPer100g: 2.4, fatPer100g: 0.4, carbPer100g: 7.2, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Espinaca, cruda", category: "Verduras", state: "RAW", kcalPer100g: 23, proteinPer100g: 2.9, fatPer100g: 0.4, carbPer100g: 3.6, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Choclo, cocido", category: "Verduras", state: "COOKED", kcalPer100g: 96, proteinPer100g: 3.4, fatPer100g: 1.5, carbPer100g: 21, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Berenjena, cocida", category: "Verduras", state: "COOKED", kcalPer100g: 35, proteinPer100g: 0.8, fatPer100g: 0.2, carbPer100g: 8.6, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Morrón rojo, crudo", category: "Verduras", state: "RAW", kcalPer100g: 31, proteinPer100g: 1, fatPer100g: 0.3, carbPer100g: 6, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},

  // --- Frutas ---
  { name: "Manzana", category: "Frutas", state: "RAW", kcalPer100g: 52, proteinPer100g: 0.3, fatPer100g: 0.2, carbPer100g: 13.8, householdUnitName: "1 unidad mediana", householdUnitGrams: 150, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Banana", category: "Frutas", state: "RAW", kcalPer100g: 89, proteinPer100g: 1.1, fatPer100g: 0.3, carbPer100g: 22.8, householdUnitName: "1 unidad mediana", householdUnitGrams: 120, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Naranja", category: "Frutas", state: "RAW", kcalPer100g: 47, proteinPer100g: 0.9, fatPer100g: 0.1, carbPer100g: 11.8, householdUnitName: "1 unidad mediana", householdUnitGrams: 180, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Pera", category: "Frutas", state: "RAW", kcalPer100g: 57, proteinPer100g: 0.4, fatPer100g: 0.1, carbPer100g: 15.2, householdUnitName: "1 unidad mediana", householdUnitGrams: 150, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Frutilla", category: "Frutas", state: "RAW", kcalPer100g: 32, proteinPer100g: 0.7, fatPer100g: 0.3, carbPer100g: 7.7, householdUnitName: "1 taza", householdUnitGrams: 150, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Uva", category: "Frutas", state: "RAW", kcalPer100g: 69, proteinPer100g: 0.7, fatPer100g: 0.2, carbPer100g: 18.1, householdUnitName: "1 taza", householdUnitGrams: 150, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Palta", category: "Frutas", state: "RAW", kcalPer100g: 160, proteinPer100g: 2, fatPer100g: 14.7, carbPer100g: 8.5, householdUnitName: "1/2 unidad", householdUnitGrams: 100, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: true, suitableMainMeal: true},
  { name: "Melón", category: "Frutas", state: "RAW", kcalPer100g: 34, proteinPer100g: 0.8, fatPer100g: 0.2, carbPer100g: 8.2, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Durazno", category: "Frutas", state: "RAW", kcalPer100g: 39, proteinPer100g: 0.9, fatPer100g: 0.3, carbPer100g: 9.5, householdUnitName: "1 unidad mediana", householdUnitGrams: 150, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: true, suitableMainMeal: false},

  // --- Frutos secos y semillas ---
  { name: "Nuez", category: "Frutos secos y semillas", state: "RAW", kcalPer100g: 654, proteinPer100g: 15.2, fatPer100g: 65.2, carbPer100g: 13.7, householdUnitName: "1 puñado (6 unidades)", householdUnitGrams: 30, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Almendra", category: "Frutos secos y semillas", state: "RAW", kcalPer100g: 579, proteinPer100g: 21.2, fatPer100g: 49.9, carbPer100g: 21.6, householdUnitName: "1 puñado", householdUnitGrams: 30, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Maní", category: "Frutos secos y semillas", state: "RAW", kcalPer100g: 567, proteinPer100g: 25.8, fatPer100g: 49.2, carbPer100g: 16.1, householdUnitName: "1 puñado", householdUnitGrams: 30, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Semillas de chía", category: "Frutos secos y semillas", state: "RAW", kcalPer100g: 486, proteinPer100g: 16.5, fatPer100g: 30.7, carbPer100g: 42.1, householdUnitName: "1 cda", householdUnitGrams: 12, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Semillas de girasol", category: "Frutos secos y semillas", state: "RAW", kcalPer100g: 584, proteinPer100g: 20.8, fatPer100g: 51.5, carbPer100g: 20, householdUnitName: "1 cda", householdUnitGrams: 12, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: true, suitableMainMeal: false},

  // --- Grasas y aceites ---
  { name: "Aceite de oliva", category: "Grasas y aceites", state: "NA", kcalPer100g: 884, proteinPer100g: 0, fatPer100g: 100, carbPer100g: 0, householdUnitName: "1 cda", householdUnitGrams: 14, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Aceite de girasol", category: "Grasas y aceites", state: "NA", kcalPer100g: 884, proteinPer100g: 0, fatPer100g: 100, carbPer100g: 0, householdUnitName: "1 cda", householdUnitGrams: 14, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: false, suitableMainMeal: true},
  { name: "Manteca", category: "Grasas y aceites", state: "NA", kcalPer100g: 717, proteinPer100g: 0.9, fatPer100g: 81.1, carbPer100g: 0.1, sodiumMgPer100g: 11, householdUnitName: "1 cdta", householdUnitGrams: 5, source: "ANMAT", sourceDetail: ANMAT_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Mayonesa", category: "Grasas y aceites", state: "NA", kcalPer100g: 680, proteinPer100g: 1, fatPer100g: 75, carbPer100g: 2, sodiumMgPer100g: 590, householdUnitName: "1 cda", householdUnitGrams: 15, source: "ANMAT", sourceDetail: ANMAT_NOTE , suitableBreakfast: false, suitableMainMeal: true},

  // --- Azúcares y dulces ---
  { name: "Azúcar de mesa", category: "Azúcares y dulces", state: "NA", kcalPer100g: 387, proteinPer100g: 0, fatPer100g: 0, carbPer100g: 100, householdUnitName: "1 cdta", householdUnitGrams: 5, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Miel", category: "Azúcares y dulces", state: "NA", kcalPer100g: 304, proteinPer100g: 0.3, fatPer100g: 0, carbPer100g: 82.4, householdUnitName: "1 cda", householdUnitGrams: 20, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Dulce de leche", category: "Azúcares y dulces", state: "NA", kcalPer100g: 315, proteinPer100g: 6.5, fatPer100g: 6.4, carbPer100g: 56, sodiumMgPer100g: 90, householdUnitName: "1 cda", householdUnitGrams: 20, source: "ANMAT", sourceDetail: ANMAT_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Mermelada", category: "Azúcares y dulces", state: "NA", kcalPer100g: 250, proteinPer100g: 0.4, fatPer100g: 0.1, carbPer100g: 65, householdUnitName: "1 cda", householdUnitGrams: 20, source: "ANMAT", sourceDetail: ANMAT_NOTE , suitableBreakfast: true, suitableMainMeal: false},

  // --- Productos envasados ---
  { name: "Galletitas de agua", category: "Productos envasados", state: "NA", kcalPer100g: 430, proteinPer100g: 10, fatPer100g: 12, carbPer100g: 71, sodiumMgPer100g: 780, householdUnitName: "3 unidades", householdUnitGrams: 15, source: "ANMAT", sourceDetail: ANMAT_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Copos de maíz (cereal de desayuno)", category: "Productos envasados", state: "NA", kcalPer100g: 378, proteinPer100g: 7, fatPer100g: 1, carbPer100g: 84, sodiumMgPer100g: 660, householdUnitName: "1 taza", householdUnitGrams: 30, source: "ANMAT", sourceDetail: ANMAT_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Barrita de cereal", category: "Productos envasados", state: "NA", kcalPer100g: 390, proteinPer100g: 6, fatPer100g: 9, carbPer100g: 72, sodiumMgPer100g: 150, householdUnitName: "1 unidad", householdUnitGrams: 25, source: "ANMAT", sourceDetail: ANMAT_NOTE , suitableBreakfast: true, suitableMainMeal: false},
  { name: "Granola", category: "Productos envasados", state: "NA", kcalPer100g: 450, proteinPer100g: 9, fatPer100g: 15, carbPer100g: 64, sodiumMgPer100g: 20, householdUnitName: "1 taza", householdUnitGrams: 60, source: "ANMAT", sourceDetail: ANMAT_NOTE , suitableBreakfast: true, suitableMainMeal: false},

  // --- Bebidas ---
  { name: "Gaseosa cola", category: "Bebidas", state: "NA", kcalPer100g: 42, proteinPer100g: 0, fatPer100g: 0, carbPer100g: 10.6, sodiumMgPer100g: 5, householdUnitName: "1 vaso", householdUnitGrams: 200, source: "ANMAT", sourceDetail: ANMAT_NOTE , suitableBreakfast: false, suitableMainMeal: false},
  { name: "Jugo de naranja exprimido", category: "Bebidas", state: "NA", kcalPer100g: 45, proteinPer100g: 0.7, fatPer100g: 0.2, carbPer100g: 10.4, householdUnitName: "1 vaso", householdUnitGrams: 200, source: "SARA2", sourceDetail: SARA2_NOTE , suitableBreakfast: true, suitableMainMeal: false},
];

export interface SeedResult {
  created: string[];
  skipped: string[];
}

export async function seedFoods(): Promise<SeedResult> {
  const created: string[] = [];
  const skipped: string[] = [];

  for (const food of seedFoodsData) {
    const existing = await prisma.foodItem.findFirst({ where: { name: food.name } });
    if (existing) {
      skipped.push(food.name);
      continue;
    }
    await createFoodItem(food, "Carga inicial (seed).");
    created.push(food.name);
  }

  return { created, skipped };
}

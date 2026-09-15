import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Prisma } from "@prisma/client";
import { BMR_FORMULA_LABELS, GOAL_TYPE_LABELS } from "@/lib/nutrition/labels";
import { formatCookedYield, formatHouseholdUnit } from "@/lib/plan/format";

type PlanWithMeals = Prisma.PlanGetPayload<{
  include: {
    meals: { include: { items: { include: { foodItem: { select: { cookedYieldFactor: true } } } } } };
  };
}>;

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#52514e", marginBottom: 10 },
  disclaimer: {
    fontSize: 8,
    color: "#78350f",
    backgroundColor: "#fffbeb",
    padding: 8,
    borderRadius: 4,
    marginBottom: 14,
  },
  mealCard: {
    marginBottom: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 6,
  },
  mealName: { fontSize: 13, fontWeight: 700, marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  itemName: { flex: 1 },
  itemQty: { width: 160, textAlign: "right", color: "#3f3e3b" },
  itemQtySmall: { fontSize: 8, color: "#9ca3af" },
  itemKcal: { width: 60, textAlign: "right" },
  mealTotals: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#e4e4e7",
    color: "#52514e",
    fontSize: 9,
  },
  dailyTotals: {
    marginTop: 8,
    padding: 10,
    backgroundColor: "#fafafa",
    borderRadius: 6,
  },
  dailyTotalsTitle: { fontSize: 12, fontWeight: 700, marginBottom: 6 },
  dailyRow: { flexDirection: "row", justifyContent: "space-between" },
});

function sumMeal(items: PlanWithMeals["meals"][number]["items"]) {
  return items.reduce(
    (acc, i) => ({
      kcal: acc.kcal + i.computedKcal,
      protein: acc.protein + i.computedProtein,
      fat: acc.fat + i.computedFat,
      carb: acc.carb + i.computedCarb,
    }),
    { kcal: 0, protein: 0, fat: 0, carb: 0 },
  );
}

export function PlanDocument({ plan }: { plan: PlanWithMeals }) {
  const dailyTotals = plan.meals.reduce(
    (acc, meal) => {
      const t = sumMeal(meal.items);
      return {
        kcal: acc.kcal + t.kcal,
        protein: acc.protein + t.protein,
        fat: acc.fat + t.fat,
        carb: acc.carb + t.carb,
      };
    },
    { kcal: 0, protein: 0, fat: 0, carb: 0 },
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Plan alimentario{plan.label ? ` — ${plan.label}` : ""}</Text>
        <Text style={styles.subtitle}>
          {new Date(plan.createdAt).toLocaleDateString("es-AR")} · {BMR_FORMULA_LABELS[plan.formula]} ·{" "}
          {GOAL_TYPE_LABELS[plan.goalType]} · {Math.round(plan.targetKcal)} kcal objetivo
        </Text>

        <Text style={styles.disclaimer}>
          Herramienta orientativa: este plan no reemplaza la consulta con un/a nutricionista matriculado/a. Los
          valores nutricionales de los alimentos son de referencia y pueden no reflejar el producto real.
        </Text>

        {plan.meals.map((meal) => {
          const totals = sumMeal(meal.items);
          return (
            <View key={meal.id} style={styles.mealCard} wrap={false}>
              <Text style={styles.mealName}>{meal.name}</Text>
              {meal.items.map((item) => {
                // La fuente Helvetica base del PDF no tiene el glifo "≈" (se ve como "H" suelta);
                // se reemplaza por "~" solo en el PDF, la UI web sigue mostrando "≈".
                const household = formatHouseholdUnit(item.grams, item.householdUnitName, item.householdUnitGrams)?.replace(
                  "≈",
                  "~",
                );
                const cookedYield = formatCookedYield(item.grams, item.state, item.foodItem?.cookedYieldFactor)?.replace(
                  "≈",
                  "~",
                );
                return (
                  <View key={item.id} style={styles.row}>
                    <Text style={styles.itemName}>{item.foodName}</Text>
                    <Text style={styles.itemQty}>
                      {household ?? `${item.grams}g`}
                      {household ? <Text style={styles.itemQtySmall}>{` (${item.grams}g)`}</Text> : null}
                      {cookedYield ? <Text style={styles.itemQtySmall}>{`\n${cookedYield}`}</Text> : null}
                    </Text>
                    <Text style={styles.itemKcal}>{Math.round(item.computedKcal)} kcal</Text>
                  </View>
                );
              })}
              <View style={styles.mealTotals}>
                <Text>
                  {Math.round(totals.kcal)}/{Math.round(meal.targetKcal)} kcal
                </Text>
                <Text>
                  P {Math.round(totals.protein)}/{Math.round(meal.targetProteinG)}g
                </Text>
                <Text>
                  G {Math.round(totals.fat)}/{Math.round(meal.targetFatG)}g
                </Text>
                <Text>
                  C {Math.round(totals.carb)}/{Math.round(meal.targetCarbG)}g
                </Text>
              </View>
            </View>
          );
        })}

        <View style={styles.dailyTotals}>
          <Text style={styles.dailyTotalsTitle}>Totales del día vs. objetivo</Text>
          <View style={styles.dailyRow}>
            <Text>
              Kcal: {Math.round(dailyTotals.kcal)}/{Math.round(plan.targetKcal)}
            </Text>
            <Text>
              Proteína: {Math.round(dailyTotals.protein)}/{Math.round(plan.targetProteinG)}g
            </Text>
            <Text>
              Grasa: {Math.round(dailyTotals.fat)}/{Math.round(plan.targetFatG)}g
            </Text>
            <Text>
              Carbohidrato: {Math.round(dailyTotals.carb)}/{Math.round(plan.targetCarbG)}g
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

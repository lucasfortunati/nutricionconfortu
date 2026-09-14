import { seedFoods } from "../src/lib/foods/seedData";
import { prisma } from "../src/lib/prisma";

async function main() {
  const { created, skipped } = await seedFoods();
  for (const name of created) console.log(`  + ${name}`);
  for (const name of skipped) console.log(`  - Ya existe, se omite: ${name}`);
  console.log(`Listo. ${created.length} creados, ${skipped.length} ya existían.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


import { DataSource} from "typeorm";
import { LevelCodes } from "src/typeorm/level-codes.entity";
import { v4 as uuidv4 } from "uuid";
import * as dotenv from "dotenv";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import databaseConfig from "../config/database.config";



dotenv.config();


const dbConfig = databaseConfig() as PostgresConnectionOptions;


const dataSource = new DataSource({
  ...dbConfig,
  type: "postgres", 
  entities: [LevelCodes], 
  synchronize: false, 
});

// Seed function
export async function seedLevelCodes() {
  await dataSource.initialize();
  const levelCodeRepository = dataSource.getRepository(LevelCodes);

  try {
    // Generate 10 Normal Admin codes (level: 1)
    const normalCodes = Array.from({ length: 10 }, () => ({
      code: uuidv4(), // Generate UUID
      level: 1,
      isActive: true,
    }));

    // Generate 10 Super Admin codes (level: 2)
    const superCodes = Array.from({ length: 10 }, () => ({
      code: uuidv4(), // Generate UUID
      level: 2,
      isActive: true,
    }));

    // Combine all codes
    const codes = [...normalCodes, ...superCodes];

    // Insert codes if they don't already exist
    for (const code of codes) {
      const exists = await levelCodeRepository.findOne({ where: { code: code.code } });
      if (!exists) {
        await levelCodeRepository.save(levelCodeRepository.create(code));
      }
    }

    console.log("10 Normal Admin and 10 Super Admin level codes successfully seeded.");
  } catch (error) {
    console.error("Error seeding level codes:", error.message);
  } finally {
    await dataSource.destroy();
  }
}

// Run the seed function
seedLevelCodes().catch((error) => {
  console.error("Seed process failed:", error.message);
  process.exit(1);
});
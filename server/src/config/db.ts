import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const DB = drizzle(process.env.DATABASE_URL!);
console.log("Database connected!");

export default DB;

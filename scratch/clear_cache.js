const { neon } = require("@neondatabase/serverless");

const url = "postgresql://neondb_owner:npg_2cnSqQkC3Jet@ep-winter-sunset-atnd38sc.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(url);

async function run() {
  try {
    await sql`DELETE FROM scores_cache`;
    console.log("Database scores_cache cleared successfully!");
  } catch (e) {
    console.error("Failed to clear database cache:", e);
  }
}
run();

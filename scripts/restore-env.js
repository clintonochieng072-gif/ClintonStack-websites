const fs = require("fs");
const path = require("path");

const backupPath = path.join(__dirname, "..", ".env.local.backup");
const envPath = path.join(__dirname, "..", ".env.local");

if (fs.existsSync(backupPath)) {
  fs.copyFileSync(backupPath, envPath);
  console.log("✅ Restored .env.local from .env.local.backup");
} else {
  console.log("❌ Backup file .env.local.backup not found");
}

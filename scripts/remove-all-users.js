// scripts/remove-all-users.js
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

// Connect to MongoDB
async function connectDb() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/clintonstack"
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

// Define User schema (simplified)
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
});

async function removeUsers() {
  try {
    await connectDb();

    const User = mongoose.models.User || mongoose.model("User", UserSchema);

    // Count total users
    const totalUsers = await User.countDocuments();
    console.log(`Total users in MongoDB: ${totalUsers}`);

    // Delete all users
    const result = await User.deleteMany({});
    console.log(`Deleted ${result.deletedCount} users from MongoDB`);

    // Verify
    const remaining = await User.countDocuments();
    console.log(`Remaining users in MongoDB: ${remaining}`);
  } catch (error) {
    console.error("Error removing users:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
removeUsers();

// scripts/remove-all-users-except-admin.js
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
    console.log(`Total users in database: ${totalUsers}`);

    // Count users to delete
    const usersToDelete = await User.countDocuments({
      email: { $ne: "clintonochieng072@gmail.com" },
    });
    console.log(`Users to delete: ${usersToDelete}`);

    // Find the admin user
    const admin = await User.findOne({ email: "clintonochieng072@gmail.com" });
    if (!admin) {
      console.error("Admin user clintonochieng072@gmail.com not found!");
      return;
    }
    console.log(`Keeping admin: ${admin.name} (${admin.email})`);

    // Delete all users except admin
    const result = await User.deleteMany({
      email: { $ne: "clintonochieng072@gmail.com" },
    });
    console.log(`Deleted ${result.deletedCount} users`);

    // Verify
    const remaining = await User.countDocuments();
    console.log(`Remaining users: ${remaining}`);
  } catch (error) {
    console.error("Error removing users:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
removeUsers();

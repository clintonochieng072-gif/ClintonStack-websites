import mongoose from "mongoose";
import dotenv from "dotenv";
import Property from "../src/lib/models/Property";
import { Site } from "../src/lib/models/Site";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function deleteAllProperties() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("🗑️  Deleting all properties...");

    // Delete all properties from Property collection
    const deletedProperties = await Property.deleteMany({});
    console.log(
      `🗑️  Deleted ${deletedProperties.deletedCount} properties from Property collection`
    );

    // Update all sites to remove properties blocks from draft and published
    const sites = await Site.find({
      $or: [
        { "userWebsite.draft.blocks": { $exists: true } },
        { "userWebsite.publishedWebsite.data.blocks": { $exists: true } },
      ],
    });

    let updatedSitesCount = 0;

    for (const site of sites) {
      let modified = false;

      // Remove properties/listings/featured blocks from draft
      if (site.userWebsite?.draft?.blocks) {
        const originalDraftBlocks = site.userWebsite.draft.blocks.length;
        site.userWebsite.draft.blocks = site.userWebsite.draft.blocks.filter(
          (block: any) =>
            !["properties", "listings", "featured"].includes(block.type)
        );
        if (site.userWebsite.draft.blocks.length !== originalDraftBlocks) {
          modified = true;
        }
      }

      // Clear properties from flat draft data
      if (site.userWebsite?.draft && site.userWebsite.draft.properties) {
        delete site.userWebsite.draft.properties;
        modified = true;
      }

      // Remove properties/listings/featured blocks from published
      if (site.userWebsite?.publishedWebsite?.data?.blocks) {
        const originalPublishedBlocks =
          site.userWebsite.publishedWebsite.data.blocks.length;
        site.userWebsite.publishedWebsite.data.blocks =
          site.userWebsite.publishedWebsite.data.blocks.filter(
            (block: any) =>
              !["properties", "listings", "featured"].includes(block.type)
          );
        if (
          site.userWebsite.publishedWebsite.data.blocks.length !==
          originalPublishedBlocks
        ) {
          modified = true;
        }
      }

      // Clear properties from flat published data
      if (
        site.userWebsite?.publishedWebsite?.data &&
        site.userWebsite.publishedWebsite.data.properties
      ) {
        delete site.userWebsite.publishedWebsite.data.properties;
        modified = true;
      }

      if (modified) {
        await site.save();
        updatedSitesCount++;
      }
    }

    console.log(
      `✅ Updated ${updatedSitesCount} sites to remove properties blocks`
    );

    console.log("🎉 All properties deleted successfully!");
  } catch (error) {
    console.error("❌ Error deleting properties:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the delete function
deleteAllProperties();

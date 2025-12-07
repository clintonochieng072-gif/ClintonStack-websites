import mongoose from "mongoose";
import dotenv from "dotenv";
import Property from "../src/lib/models/Property";
import { Site } from "../src/lib/models/Site";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function checkProperties() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("🔍 Checking for properties...");

    // Check Property collection
    const propertyCount = await Property.countDocuments();
    console.log(`📊 Properties in Property collection: ${propertyCount}`);

    // Check sites for properties data
    const sites = await Site.find({});
    let sitesWithProperties = 0;
    let totalPropertiesFound = 0;

    for (const site of sites) {
      let hasProperties = false;

      // Check draft blocks
      if (site.userWebsite?.draft?.blocks) {
        const propertiesBlock = site.userWebsite.draft.blocks.find(
          (b: any) => b.type === "properties"
        );
        if (propertiesBlock?.data?.properties?.length > 0) {
          console.log(
            `🏠 Site ${site.slug} has ${propertiesBlock.data.properties.length} properties in draft blocks`
          );
          hasProperties = true;
          totalPropertiesFound += propertiesBlock.data.properties.length;
        }
      }

      // Check draft flat data
      if (site.userWebsite?.draft?.properties?.length > 0) {
        console.log(
          `🏠 Site ${site.slug} has ${site.userWebsite.draft.properties.length} properties in draft flat data`
        );
        hasProperties = true;
        totalPropertiesFound += site.userWebsite.draft.properties.length;
      }

      // Check published blocks
      if (site.userWebsite?.publishedWebsite?.data?.blocks) {
        const propertiesBlock =
          site.userWebsite.publishedWebsite.data.blocks.find(
            (b: any) => b.type === "properties"
          );
        if (propertiesBlock?.data?.properties?.length > 0) {
          console.log(
            `🏠 Site ${site.slug} has ${propertiesBlock.data.properties.length} properties in published blocks`
          );
          hasProperties = true;
          totalPropertiesFound += propertiesBlock.data.properties.length;
        }
      }

      // Check published flat data
      if (site.userWebsite?.publishedWebsite?.data?.properties?.length > 0) {
        console.log(
          `🏠 Site ${site.slug} has ${site.userWebsite.publishedWebsite.data.properties.length} properties in published flat data`
        );
        hasProperties = true;
        totalPropertiesFound +=
          site.userWebsite.publishedWebsite.data.properties.length;
      }

      if (hasProperties) {
        sitesWithProperties++;
      }
    }

    console.log(`📊 Total sites with properties: ${sitesWithProperties}`);
    console.log(
      `📊 Total properties found across all sites: ${totalPropertiesFound}`
    );

    if (propertyCount === 0 && sitesWithProperties === 0) {
      console.log("✅ No properties found anywhere!");
    } else {
      console.log("❌ Properties still exist!");
    }
  } catch (error) {
    console.error("❌ Error checking properties:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the check function
checkProperties();

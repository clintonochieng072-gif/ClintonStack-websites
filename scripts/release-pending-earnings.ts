#!/usr/bin/env tsx

import { placeholderCronJob } from '../src/lib/cron';
import dbConnect from '../src/lib/mongodb';

async function main() {
  try {
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected successfully');

    await placeholderCronJob();
    console.log('Script completed successfully');
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

main();
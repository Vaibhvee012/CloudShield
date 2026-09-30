import { runAWSSyncJob } from "./awsSyncJob";

const AWS_SYNC_INTERVAL = 30 * 60 * 1000; // 30 minutes

export const startScheduler = async () => {
  console.log("⏰ AWS security scheduler started");

  // Run once immediately when the server starts
  await runAWSSyncJob();

  // Continue running every 30 minutes
  setInterval(async () => {
    await runAWSSyncJob();
  }, AWS_SYNC_INTERVAL);
};
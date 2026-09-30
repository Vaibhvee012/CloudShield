import { syncAWSResources } from "../services/awsResourcePersistence";
import { syncAWSSecurityFindings } from "../services/awsFindingPersistence";

export const runAWSSyncJob = async () => {
  try {
    console.log("🔄 Starting automatic AWS sync...");

    const resources = await syncAWSResources();
    const findings = await syncAWSSecurityFindings();

    console.log(
      `✅ AWS sync completed: ${resources.length} resources, ${findings.length} active findings`
    );
  } catch (error) {
    console.error("❌ Automatic AWS sync failed:", error);
  }
};
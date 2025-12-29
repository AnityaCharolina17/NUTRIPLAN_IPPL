import app from "./app";
import { setupMenuAutoAssignment } from "./utils/cronScheduler";

const PORT = process.env.PORT || 5000;

// Start CRON scheduler
setupMenuAutoAssignment();

app.listen(PORT, () => {
  console.log(`Nutriplan API running on port ${PORT}`);
});
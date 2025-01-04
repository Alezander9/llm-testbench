import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "process transactions",
  { minutes: 1 }, // every minute
  internal.mutations.processTransactions
);

export default crons;

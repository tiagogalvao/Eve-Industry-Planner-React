import findOrGetJobObject from "./findJobObject";

async function getAllRelatedJobs(inputJobIDs, jobArray, retrievedJobs = []) {
  try {
    if (!inputJobIDs || !jobArray || !retrievedJobs) {
      throw new Error("missing input");
    }
    let stack;
    const jobIDMap = {};

    if (typeof inputJobIDs === "string") {
      stack = [inputJobIDs];
    } else if (Array.isArray(inputJobIDs)) {
      stack = inputJobIDs;
    } else if (inputJobIDs instanceof Set) {
      stack = Array.from(inputJobIDs);
    } else {
      throw new Error(
        "Invalid inputItem type. Expected a string, array, or set."
      );
    }

    while (stack.length > 0) {
      const jobID = stack.pop();
      if (jobIDMap[jobID]) continue;

      const matchedJob = await findOrGetJobObject(
        jobID,
        jobArray,
        retrievedJobs
      );
      if (!matchedJob) continue;

      jobIDMap[jobID] = matchedJob;

      const relatedJobs = matchedJob.getRelatedJobs();
      if (relatedJobs && Array.isArray(relatedJobs)) {
        stack.push(...relatedJobs);
      }
    }

    return Object.values(jobIDMap);
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default getAllRelatedJobs;

import getJobDocumentFromFirebase from "../Firebase/getJobDocument";

async function findOrGetJobObject(requestedJobID, jobArray) {
  try {
    if (!requestedJobID || !jobArray) {
      throw new Error("Missing requested input or job array");
    }

    const matchedJob = jobArray.find(({ jobID }) => jobID === requestedJobID);

    if (matchedJob) {
      return matchedJob;
    } else {
      const retrievedJob = await getJobDocumentFromFirebase(requestedJobID);

      if (!retrievedJob) {
        throw new Error("Unable to find job.");
      }
      return retrievedJob;
    }
  } catch (err) {
    console.error("Error finding job object:", err);
    return null;
  }
}

export default findOrGetJobObject;

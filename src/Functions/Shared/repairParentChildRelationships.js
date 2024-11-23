import findOrGetJobObject from "../Helper/findJobObject";

async function repairMissingParentChildRelationships(
  inputJob,
  jobArray,
  retrievedJobs
) {
  try {
    if (!inputJob || !jobArray || !retrievedJobs) {
      throw new Error("Missing Inputs");
    }
    const modifiedJobIDs = new Set();
    const parentIDsToRemove = new Set();

    for (let parentID of inputJob.parentJob) {
      try {
        const isParentIDValid = await processParentID(
          parentID,
          inputJob,
          jobArray,
          retrievedJobs,
          modifiedJobIDs
        );

        if (!isParentIDValid) {
          parentIDsToRemove.add(parentID);
        }
        inputJob.removeParentJob(parentIDsToRemove);
      } catch (err) {
        console.error(`Error processing parentID ${parentID}:`, err.message);
        parentIDsToRemove.add(parentID);
      }
    }

    for (let material of inputJob.build.materials) {
      const childJobsToRemove = new Set();

      for (let childJobID of inputJob.build.childJobs[material.typeID]) {
        const isChildValid = await processChildID(
          childJobID,
          material,
          inputJob.jobID,
          jobArray,
          retrievedJobs,
          modifiedJobIDs
        );

        if (!isChildValid) {
          childJobsToRemove.add(childJobID);
        }
      }
      inputJob.removeChildJob(material.typeID, childJobsToRemove);
    }

    return modifiedJobIDs;
  } catch (err) {
    console.error(err);
  }
}

export default repairMissingParentChildRelationships;

async function processParentID(
  parentID,
  inputJob,
  jobArray,
  retrievedJobs,
  modifiedJobsSet
) {
  const matchedJob = await findOrGetJobObject(
    parentID,
    jobArray,
    retrievedJobs
  );
  if (!matchedJob) return false;

  const parentMaterial = matchedJob.build.materials.find(
    (mat) => mat.typeID === inputJob.itemID
  );

  if (!parentMaterial) {
    matchedJob.build.materials.forEach((material) => {
      if (
        matchedJob.build.childJobs[material.typeID].includes(inputJob.jobID)
      ) {
        matchedJob.removeChildJob(material.typeID, inputJob.typeID);
      }
    });

    return false;
  }

  const childJobLocation = matchedJob.build.childJobs[parentMaterial.typeID];

  if (!childJobLocation.includes(inputJob.jobID)) {
    matchedJob.addChildJob(parentMaterial.typeID, inputJob.jobID);
    modifiedJobsSet.add(parentID);
  }

  return true;
}

async function processChildID(
  childID,
  material,
  inputJobID,
  jobArray,
  retrievedJobs,
  modifiedJobsSet
) {
  const matchedJob = await findOrGetJobObject(childID, jobArray, retrievedJobs);

  if (!matchedJob) {
    return false;
  }

  if (matchedJob.itemID !== material.typeID) {
    matchedJob.removeParentJob(inputJobID);
    return false;
  }

  if (!matchedJob.parentJob.includes(inputJobID)) {
    matchedJob.addParentJob(inputJobID);
    modifiedJobsSet.add(childID);
  }

  return true;
}

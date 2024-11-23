import findOrGetJobObject from "../../../Functions/Helper/findJobObject";

async function applyParentChildChanges(
  parentChildObject,
  inputJob,
  jobArray,
  retrievedJobs
) {
  try {
    if (!parentChildObject || !jobArray || !retrievedJobs) {
      throw new Error("Missing input items");
    }

    const modifiedJobIDs = new Set();

    await processParentJobs(
      parentChildObject,
      inputJob,
      jobArray,
      retrievedJobs,
      modifiedJobIDs
    );
    await processChildJobs(
      parentChildObject,
      inputJob,
      jobArray,
      retrievedJobs,
      modifiedJobIDs
    );

    return modifiedJobIDs;
  } catch (err) {
    console.error("Error apply parent child changes to jobs:", err);
    return new Set();
  }
}
export default applyParentChildChanges;

async function processParentJobs(
  parentChildObject,
  inputJob,
  jobArray,
  retrievedJobs,
  modifiedJobIDs
) {
  try {
    for (let parentID of parentChildObject.parentJobs.remove) {
      const matchingJob = await findOrGetJobObject(
        parentID,
        jobArray,
        retrievedJobs
      );
      if (!matchingJob) continue;

      matchingJob.removeChildJob(inputJob.itemID, inputJob.jobID);
      modifiedJobIDs.add(parentID);
    }

    inputJob.removeParentJob(parentChildObject.parentJobs.remove);

    const unmatchedParentIDS = new Set();
    for (let parentID of parentChildObject.parentJobs.add) {
      const matchingJob = await findOrGetJobObject(
        parentID,
        jobArray,
        retrievedJobs
      );

      if (!matchingJob) {
        unmatchedParentIDS.add(parentID);
        continue;
      }

      matchingJob.addChildJob(inputJob.itemID, inputJob.jobID);
      modifiedJobIDs.add(parentID);
    }
    inputJob.addParentJob(
      parentChildObject.parentJobs.add.filter(
        (id) => !unmatchedParentIDS.has(id)
      )
    );
  } catch (err) {
    throw new Error(`Error updating parent jobs: ${err.message}`);
  }
}

async function processChildJobs(
  parentChildObject,
  inputJob,
  jobArray,
  retrievedJobs,
  modifiedJobIDs
) {
  try {
    for (let material of inputJob.build.materials) {
      const unMatchedChildIDs = new Set();
      const matchedMaterial = parentChildObject.childJobs[material.typeID];

      if (!matchedMaterial) continue;

      for (let childID of matchedMaterial.add) {
        const matchedJob = await findOrGetJobObject(
          childID,
          jobArray,
          retrievedJobs
        );

        if (!matchedJob) {
          unMatchedChildIDs.add(childID);
          continue;
        }

        matchedJob.addParentJob(inputJob.jobID);
        modifiedJobIDs.add(childID);
      }

      for (let childID of matchedMaterial.remove) {
        const matchedJob = await findOrGetJobObject(
          childID,
          jobArray,
          retrievedJobs
        );

        if (!matchedJob) {
          unMatchedChildIDs.add(childID);
          continue;
        }

        matchedJob.removeParentJob(inputJob.jobID);
        modifiedJobIDs.add(childID);
      }
      inputJob.addChildJob(
        material.typeID,
        matchedMaterial.add.filter((id) => !unMatchedChildIDs.has(id))
      );
      inputJob.removeChildJob(material.typeID, unMatchedChildIDs);
    }
  } catch (err) {
    throw new Error(`Error updating child jobs: ${err.message}`);
  }
}

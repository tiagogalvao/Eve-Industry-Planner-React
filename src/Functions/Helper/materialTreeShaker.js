function materialTreeShaker(allJobObjects, recalculateJob) {
  if (!allJobObjects || !recalculateJob) {
    console.log("Missing inputs ");
    return;
  }

  let jobsRecalculated;
  const maxIterations = 100;
  let iterationCounter = 0;

  do {
    jobsRecalculated = false;

    allJobObjects.forEach((job) => {
      let parentJobRequirements = getParentJobRequirements(job, allJobObjects);
      let needsRecalculation = shouldRecalculate(job, parentJobRequirements);

      if (needsRecalculation) {
        recalculateJob(job, parentJobRequirements);
        jobsRecalculated = true;
      }
    });
    iterationCounter++;
    if (iterationCounter > maxIterations) {
      break;
    }
  } while (jobsRecalculated);
}

function getParentJobRequirements(job, allJobs) {
  return job.parentJob.reduce((total, parentJobID) => {
    const parentJob = allJobs.find(({ jobID }) => jobID === parentJobID);
    if (parentJob) {
      const material = parentJob.build.materials.find(
        ({ typeID }) => typeID === job.itemID
      );
      if (material) {
        return total + (material.quantity || 0);
      }
    }
    return total;
  }, 0);
}

const shouldRecalculate = (job, parentJobRequirements) => {
  const neededRuns = Math.ceil(parentJobRequirements / job.itemsProducedPerRun);
  const minBuildQuantity = neededRuns * job.itemsProducedPerRun;
  const { totalQuantity: currentProduction } = job.build.products;

  const isOverproducing =
    currentProduction > minBuildQuantity + job.itemsProducedPerRun;
  const isUnderproducing = currentProduction < minBuildQuantity;
  const isItemAParent = job.parentJob.length > 0;

  return isUnderproducing || (isOverproducing && !isItemAParent);
};

export default materialTreeShaker;

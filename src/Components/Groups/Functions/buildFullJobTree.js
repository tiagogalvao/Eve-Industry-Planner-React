import buildParentChildRelationships from "../../../Functions/Helper/buildParentChildRelationships";
import checkJobTypeIsBuildable from "../../../Functions/Helper/checkJobTypeIsBuildable";
import convertJobIDsToObjects from "../../../Functions/Helper/convertJobIDsToObjects";
import retrieveJobIDsFromGroupObjects from "../../../Functions/Helper/getJobIDsFromGroupObjects";
import materialTreeShaker from "../../../Functions/Helper/materialTreeShaker";

async function buildFullJobTree(
  selectedJobIDs,
  jobArray,
  retrievedJobs,
  groupID,
  groupArray,
  applicationSettings,
  buildJobFunction,
  recalculateJob,
  setNumberOfVisibleSkeletonElements,
  buildFullItemTree = false
) {
  const jobIDsIncludedInGroup = retrieveJobIDsFromGroupObjects(
    groupID,
    groupArray
  );

  const allJobObjects = await convertJobIDsToObjects(
    [...new Set([...selectedJobIDs, ...jobIDsIncludedInGroup])],
    jobArray,
    retrievedJobs
  );

  const requestedJobObjects = await convertJobIDsToObjects(
    selectedJobIDs,
    jobArray,
    retrievedJobs
  );

  const typeIDMap = buildTypeIDMap(allJobObjects, groupID);

  const jobIDMap = buildJobIDMap(allJobObjects);

  const materialRequests = generateMaterialRequests(
    requestedJobObjects,
    applicationSettings,
    typeIDMap,
    groupID
  );
  setNumberOfVisibleSkeletonElements(materialRequests.length);
  const newJobs = await processMaterials(
    typeIDMap,
    jobIDMap,
    materialRequests,
    groupID,
    buildJobFunction,
    applicationSettings,
    buildFullItemTree,
    setNumberOfVisibleSkeletonElements
  );

  buildParentChildRelationships([...allJobObjects, ...newJobs]);

  materialTreeShaker([...allJobObjects, ...newJobs], recalculateJob);
  setNumberOfVisibleSkeletonElements(0);

  return newJobs;
}

function buildTypeIDMap(inputJobs, groupID) {
  const materialMap = {};

  for (const job of inputJobs) {
    const existingEntry = materialMap[job.itemID];

    const newEntry = buildTypeIDMapObject(job, groupID);

    if (existingEntry) {
      materialMap[job.itemID] = mergeTypeIDMapEntries(existingEntry, newEntry);
    } else {
      materialMap[job.itemID] = newEntry;
    }
  }
  return materialMap;
}

function buildTypeIDMapObject(job, groupID) {
  return {
    name: job.name,
    typeID: job.itemID,
    relatedJobID: job.jobID,
    parentJobs: new Set(job.parentJob),
    groupID: groupID,
  };
}

function mergeTypeIDMapEntries(existingEntry, newEntry) {
  return {
    ...existingEntry,
    quantityRequired:
      existingEntry.quantityRequired + newEntry.quantityRequired, // Add quantities
    parentJobs: new Set([...existingEntry.parentJobs, ...newEntry.parentJobs]), // Merge parent jobs
    requiresRecalculation:
      existingEntry.requiresRecalculation || newEntry.requiresRecalculation, // Combine recalculation flags
    buildableMaterials:
      existingEntry.buildableMaterials || newEntry.buildableMaterials, // Merge buildable materials flag
  };
}

function buildJobIDMap(inputJobs) {
  const jobMap = {};
  for (const job of inputJobs) {
    jobMap[job.jobID] = job;
  }
  return jobMap;
}

function generateMaterialRequests(
  inputJobs,
  applicationSettings,
  typeIDMap,
  groupID
) {
  return inputJobs.flatMap((job) => {
    return job.build.materials
      .filter(
        (material) =>
          checkMaterialIsBuildable(material, applicationSettings) &&
          !typeIDMap[material.typeID]
      )
      .map((material) => ({
        typeID: material.typeID,
        groupID: groupID,
        relatedJobID: job.jobID,
      }));
  });
}

function checkMaterialIsBuildable(material, applicationSettings) {
  return (
    !applicationSettings.checkTypeIDisExempt(material.typeID) &&
    checkJobTypeIsBuildable(material.jobType)
  );
}

async function processMaterials(
  typeIDMap,
  jobIDMap,
  materialRequests,
  groupID,
  buildJobFunction,
  applicationSettings,
  buildFullItemTree,
  setNumberOfVisibleSkeletonElements
) {
  const newJobs = [];
  const processingQueue = [...materialRequests];
  const materialsAwaitingRequest = [];

  while (processingQueue.length > 0) {
    const currentMaterial = processingQueue.shift();
    try {
      const matchedMaterial = typeIDMap[currentMaterial.typeID];
      if (matchedMaterial) {
        updateExistingItemInTypeIDMap(currentMaterial, typeIDMap);
      } else {
        manageMaterialRequestQueue(materialsAwaitingRequest, currentMaterial);
      }
      if (processingQueue.length === 0 && materialsAwaitingRequest.length > 0) {
        const newJobObjects = await retrieveNewMaterials(
          materialsAwaitingRequest,
          newJobs,
          buildJobFunction
        );
        addNewItemsToTypeIDMap(newJobObjects, typeIDMap, groupID);
        addNewItemsToJobIDMap(newJobObjects, jobIDMap);

        materialsAwaitingRequest.length = 0;
      }
      if (
        processingQueue.length === 0 &&
        materialsAwaitingRequest.length === 0 &&
        buildFullItemTree
      ) {
        const nextLevelOfRequests = generateMaterialRequests(
          Object.values(jobIDMap),
          applicationSettings,
          typeIDMap,
          groupID
        );
        setNumberOfVisibleSkeletonElements(
          (prev) => (prev += nextLevelOfRequests.length)
        );
        processingQueue.push(...nextLevelOfRequests);
      }
    } catch (materialError) {
      console.error("error processing job:", materialError);
    }
  }
  return newJobs;
}

function updateExistingItemInTypeIDMap(inputMaterial, materialMap) {
  const matchedMaterial = materialMap[inputMaterial.typeID];
  matchedMaterial.parentJobs.add(inputMaterial.relatedJobID);
}

function manageMaterialRequestQueue(queue, newRequest) {
  const existingMaterial = queue.find((i) => i.itemID === newRequest.typeID);
  if (existingMaterial) {
    updateBuildRequest(existingMaterial, newRequest);
  } else {
    queue.push(createBuildRequest(newRequest));
  }
}

function createBuildRequest(request) {
  return {
    itemID: request.typeID,
    groupID: request.groupID,
    parentJobs: [request.relatedJobID],
  };
}

function updateBuildRequest(existingRequest, newRequest) {
  existingRequest.parentJobs = [
    ...new Set([...existingRequest.parentJobs, newRequest.relatedJobID]),
  ];
}

async function retrieveNewMaterials(queue, newJobsStorage, buildFunction) {
  try {
    const newJobs = await buildFunction(queue);
    newJobsStorage.push(...newJobs);
    return newJobs;
  } catch (err) {
    console.error("Error retrieving jobs");
    return [];
  }
}

function addNewItemsToTypeIDMap(newJobs, typeIDMap, groupID) {
  for (const job of newJobs) {
    typeIDMap[job.itemID] = buildTypeIDMapObject(job, groupID);
  }
}
function addNewItemsToJobIDMap(newJobs, jobIDMap) {
  for (const job of newJobs) {
    jobIDMap[job.jobID] = job;
  }
}

export default buildFullJobTree;

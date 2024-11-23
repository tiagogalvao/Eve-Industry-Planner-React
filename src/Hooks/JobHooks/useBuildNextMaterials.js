import { useContext } from "react";
import { ActiveJobContext, JobArrayContext } from "../../Context/JobContext";
import { ApplicationSettingsContext } from "../../Context/LayoutContext";
import convertJobIDsToObjects from "../../Functions/Helper/convertJobIDsToObjects";
import checkJobTypeIsBuildable from "../../Functions/Helper/checkJobTypeIsBuildable";
import { useJobBuild } from "../useJobBuild";
import buildParentChildRelationships from "../../Functions/Helper/buildParentChildRelationships";
import retrieveJobIDsFromGroupObjects from "../../Functions/Helper/getJobIDsFromGroupObjects";
import materialTreeShaker from "../../Functions/Helper/materialTreeShaker";
import { useRecalcuateJob } from "../GeneralHooks/useRecalculateJob";
import { useHelperFunction } from "../GeneralHooks/useHelperFunctions";
import getMissingESIData from "../../Functions/Shared/getMissingESIData";
import {
  EvePricesContext,
  SystemIndexContext,
} from "../../Context/EveDataContext";
import recalculateInstallCostsWithNewData from "../../Functions/Installation Costs/recalculateInstallCostsWithNewData";
import { useInstallCostsCalc } from "../GeneralHooks/useInstallCostCalc";

function useBuildJobTree() {
  const { jobArray, updateJobArray, groupArray, updateGroupArray } =
    useContext(JobArrayContext);
  const { activeGroup } = useContext(ActiveJobContext);
  const { applicationSettings } = useContext(ApplicationSettingsContext);
  const { evePrices, updateEvePrices } = useContext(EvePricesContext);
  const { systemIndexData, updateSystemIndexData } =
    useContext(SystemIndexContext);
  const { buildJob } = useJobBuild();
    const { recalculateJobForNewTotal } = useRecalcuateJob();
    const { calculateInstallCostFromJob } = useInstallCostsCalc();
  const { sendSnackbarNotificationSuccess } = useHelperFunction();
  const activeGroupObject = groupArray.find((i) => i.groupID === activeGroup);

  async function buildNextMaterials(
    inputJobIDs,
    setNumberOfVisibleSkeletonElements,
    buildFullItemTree = false
  ) {
    try {
      if (!inputJobIDs || !setNumberOfVisibleSkeletonElements) {
        throw new Error("missing inputs");
      }
      const retrievedJobs = [];

      const jobIDsIncludedInGroup = retrieveJobIDsFromGroupObjects(
        activeGroup,
        groupArray
      );

      const allJobObjects = await convertJobIDsToObjects(
        [...new Set([...inputJobIDs, ...jobIDsIncludedInGroup])],
        jobArray,
        retrievedJobs
      );

      const requestedJobObjects = await convertJobIDsToObjects(
        inputJobIDs,
        jobArray,
        retrievedJobs
      );

      const typeIDMap = buildTypeIDMap(allJobObjects);
      const jobIDMap = buildJobIDMap(allJobObjects);

      const materialRequests = generateMaterialRequests(
        requestedJobObjects,
        typeIDMap
      );

      setNumberOfVisibleSkeletonElements(materialRequests.length);
      const newJobs = await processMaterials(
        jobIDMap,
        typeIDMap,
        materialRequests,
        buildFullItemTree,
        setNumberOfVisibleSkeletonElements
      );
      buildParentChildRelationships([...allJobObjects, ...newJobs]);
      materialTreeShaker(
        [...allJobObjects, ...newJobs],
        recalculateJobForNewTotal
      );
      const { requestedMarketData, requestedSystemIndexes } =
        await getMissingESIData(
          [...allJobObjects, ...newJobs],
          evePrices,
          systemIndexData
        );

      recalculateInstallCostsWithNewData(
        [...allJobObjects, ...newJobs],
        calculateInstallCostFromJob,
        requestedMarketData,
        requestedSystemIndexes
      );

      setNumberOfVisibleSkeletonElements(0);

      activeGroupObject.addJobsToGroup(newJobs);

      updateJobArray((prev) => {
        const existingIDs = new Set(prev.map(({ jobID }) => jobID));
        return [
          ...prev,
          ...retrievedJobs.filter(({ jobID }) => !existingIDs.has(jobID)),
          ...newJobs,
        ];
      });
      updateEvePrices((prev) => ({ ...prev, ...requestedMarketData }));
      updateSystemIndexData((prev) => ({ ...prev, ...requestedSystemIndexes }));
      updateGroupArray((prev) => [...prev]);
      sendSnackbarNotificationSuccess(`${newJobs.length} Jobs Added`);
    } catch (err) {
      console.error(err);
    }
  }

  function buildTypeIDMap(inputJobs) {
    const materialMap = {};

    for (const job of inputJobs) {
      const existingEntry = materialMap[job.itemID];

      const newEntry = buildTypeIDMapObject(job);

      if (existingEntry) {
        materialMap[job.itemID] = mergeTypeIDMapEntries(
          existingEntry,
          newEntry
        );
      } else {
        materialMap[job.itemID] = newEntry;
      }
    }
    return materialMap;
  }

  function buildTypeIDMapObject(job) {
    return {
      name: job.name,
      typeID: job.itemID,
      relatedJobID: job.jobID,
      parentJobs: new Set(job.parentJob),
      groupID: activeGroup,
    };
  }

  function mergeTypeIDMapEntries(existingEntry, newEntry) {
    return {
      ...existingEntry,
      quantityRequired:
        existingEntry.quantityRequired + newEntry.quantityRequired, // Add quantities
      parentJobs: new Set([
        ...existingEntry.parentJobs,
        ...newEntry.parentJobs,
      ]), // Merge parent jobs
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

  function generateMaterialRequests(inputJobs, typeIDMap) {
    return inputJobs.flatMap((job) => {
      return job.build.materials
        .filter(
          (material) =>
            checkMaterialIsBuildable(material) && !typeIDMap[material.typeID]
        )
        .map((material) => ({
          typeID: material.typeID,
          groupID: job.groupID,
          relatedJobID: job.jobID,
        }));
    });
  }

  function checkMaterialIsBuildable(material) {
    return (
      !applicationSettings.checkTypeIDisExempt(material.typeID) &&
      checkJobTypeIsBuildable(material.jobType)
    );
  }

  async function processMaterials(
    jobIDMap,
    typeIDMap,
    materialRequests,
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
        if (
          processingQueue.length === 0 &&
          materialsAwaitingRequest.length > 0
        ) {
          const newJobObjects = await retrieveNewMaterials(
            materialsAwaitingRequest,
            newJobs
          );
          addNewItemsToTypeIDMap(newJobObjects, typeIDMap);
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
            typeIDMap
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

  function addNewItemsToTypeIDMap(newJobs, typeIDMap) {
    for (const job of newJobs) {
      typeIDMap[job.itemID] = buildTypeIDMapObject(job);
    }
  }

  function addNewItemsToJobIDMap(newJobs, jobIDMap) {
    for (const job of newJobs) {
      jobIDMap[job.jobID] = job;
    }
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
  async function retrieveNewMaterials(queue, newJobsStorage) {
    try {
      const newJobs = await buildJob(queue);
      newJobsStorage.push(...newJobs);
      return newJobs;
    } catch (err) {
      console.error("Error retrieving jobs");
      return [];
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
  return {
    buildNextMaterials,
  };
}

export default useBuildJobTree;

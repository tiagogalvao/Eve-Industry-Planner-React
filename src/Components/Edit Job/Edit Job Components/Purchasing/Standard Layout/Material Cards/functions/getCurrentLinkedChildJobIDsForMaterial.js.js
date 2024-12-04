function getCurrentLinkedChildJobIDsForMaterial(
  materialTypeID,
  activeJob,
  temporaryChildJobs,
  parentChildToEdit
) {
  return [
    ...new Set(
      [
        ...activeJob.build.childJobs[materialTypeID],
        ...(temporaryChildJobs[materialTypeID]
          ? [temporaryChildJobs[materialTypeID].jobID]
          : []),
        ...(parentChildToEdit.childJobs[materialTypeID]?.add || []),
      ].filter(
        (jobID) =>
          !parentChildToEdit.childJobs[materialTypeID]?.remove?.includes(jobID)
      )
    ),
  ];
}

export default getCurrentLinkedChildJobIDsForMaterial;

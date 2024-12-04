function recalculateInstallCostsWithNewData(
  inputJobs,
  recalculationFunction,
  newMarketData,
  newSystemIndexData
) {
  const jobsArray = Array.isArray(inputJobs) ? inputJobs : [inputJobs];
  if (
    (!newMarketData || Object.keys(newMarketData).length === 0) &&
    (!newSystemIndexData || Object.keys(newSystemIndexData).length === 0)
  ) {
    return;
  }
  jobsArray.forEach((job) => {
    Object.values(job.build.setup).forEach((setup) => {
      setup.estimatedInstallCost = recalculationFunction(
        setup,
        newMarketData,
        newSystemIndexData
      );
    });
  });
}

export default recalculateInstallCostsWithNewData;

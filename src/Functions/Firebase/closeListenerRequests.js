function closeFirebaseListeners(
  inputJobs,
  firebaseListeners,
  updateFirebaseListeners,
  isLoggedIn
) {
  if (
    !Array.isArray(inputJobs) ||
    !Array.isArray(firebaseListeners) ||
    typeof updateFirebaseListeners !== "function" ||
    typeof isLoggedIn !== "boolean"
  ) {
    console.error("Invalid inputs");
    return;
  }

  for (let job of inputJobs) {
    const listener = firebaseListeners.find((i) => i.id === job.jobID);
    if (!listener) continue;
    listener.unsubscribe();
  }

  updateFirebaseListeners((prevListeners) =>
    prevListeners.filter(
      (listener) => !inputJobs.some((job) => job.jobID === listener.id)
    )
  );
}
export default closeFirebaseListeners;

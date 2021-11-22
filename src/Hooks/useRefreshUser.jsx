import React, { useCallback, useContext } from "react";
import { RefreshTokens } from "../Components/Auth/RefreshToken";
import { firebaseAuth } from "../Components/Auth/firebaseAuth";
import { useEveApi } from "./useEveApi";
import { useFirebase } from "./useFirebase";
import { ApiJobsContext, JobArrayContext, JobStatusContext } from "../Context/JobContext";
import {
  IsLoggedInContext,
  MainUserContext,
  UsersContext,
} from "../Context/AuthContext";

export function useRefreshUser() {
  const { CharacterSkills, IndustryJobs, MarketOrders } = useEveApi();
  const { downloadCharacterData, downloadCharacterJobs } = useFirebase();
  const { setJobStatus } = useContext(JobStatusContext);
  const { updateJobArray } = useContext(JobArrayContext);
  const { updateApiJobs } = useContext(ApiJobsContext);
  const { updateUsers } = useContext(UsersContext);
  const { updateMainUser } = useContext(MainUserContext);
  const { updateIsLoggedIn } = useContext(IsLoggedInContext);

  const refreshMainUser = useCallback(
    async ({ refreshToken, setLoadingText }) => {
      setLoadingText("Logging Into Eve SSO");
      const refreshedUser = await RefreshTokens(refreshToken);
      refreshedUser.fbToken = await firebaseAuth(refreshedUser);
      setLoadingText("Loading API Data");
      refreshedUser.apiSkills = await CharacterSkills(refreshedUser);
      refreshedUser.apiJobs = await IndustryJobs(refreshedUser);
      refreshedUser.apiOrders = await MarketOrders(refreshedUser);
      refreshedUser.ParentUser = true;
      setLoadingText("Building Character Object");
      const charSettings = await downloadCharacterData(refreshedUser);
      refreshedUser.accountID = charSettings.accountID;
      const charJobs = await downloadCharacterJobs(refreshedUser);

      setJobStatus(charSettings.jobStatusArray);
      updateJobArray(charJobs);
      updateApiJobs(refreshedUser.apiJobs);
      const newUsersArray = [];
      newUsersArray.push(refreshedUser);
      updateUsers(newUsersArray);
      updateIsLoggedIn(true);
      updateMainUser(refreshedUser);
    }
  );
  return { refreshMainUser };
}

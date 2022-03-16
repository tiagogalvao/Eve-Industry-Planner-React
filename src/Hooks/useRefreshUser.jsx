import { useContext } from "react";
import { RefreshTokens } from "../Components/Auth/RefreshToken";
import { firebaseAuth } from "../Components/Auth/firebaseAuth";
import { useEveApi } from "./useEveApi";
import { useFirebase } from "./useFirebase";
import {
  ApiJobsContext,
  JobArrayContext,
  JobStatusContext,
} from "../Context/JobContext";
import { IsLoggedInContext, UsersContext } from "../Context/AuthContext";
import { LoadingTextContext, PageLoadContext } from "../Context/LayoutContext";
import jwt from "jsonwebtoken";
import { trace } from "firebase/performance";
import { performance } from "../firebase";
import { getAnalytics, logEvent } from "firebase/analytics";

export function useRefreshUser() {
  const {
    BlueprintLibrary,
    CharacterSkills,
    HistoricMarketOrders,
    IndustryJobs,
    MarketOrders,
    serverStatus,
    WalletTransactions,
    WalletJournal,
  } = useEveApi();
  const { determineUserState } = useFirebase();
  const { setJobStatus } = useContext(JobStatusContext);
  const { updateJobArray } = useContext(JobArrayContext);
  const { updateApiJobs } = useContext(ApiJobsContext);
  const { updateUsers } = useContext(UsersContext);
  const { updateIsLoggedIn } = useContext(IsLoggedInContext);
  const { updateLoadingText } = useContext(LoadingTextContext);
  const { updatePageLoad } = useContext(PageLoadContext);

  const reloadMainUser = async (refreshToken) => {
    const analytics = getAnalytics();
    const t = trace(performance, "MainUserRefreshProcessFull");
    t.start();

    updateLoadingText((prevObj) => ({
      ...prevObj,
      eveSSO: true,
    }));

    const refreshedUser = await RefreshTokens(refreshToken);
    refreshedUser.fbToken = await firebaseAuth(refreshedUser);

    updateLoadingText((prevObj) => ({
      ...prevObj,
      eveSSOComp: true,
      charData: true,
    }));

    const charSettings = await determineUserState(refreshedUser);
    refreshedUser.ParentUser = true;
    refreshedUser.accountID = charSettings.accountID;
    refreshedUser.linkedJobs = charSettings.linkedJobs;
    refreshedUser.linkedTrans = charSettings.linkedTrans;
    refreshedUser.linkedOrders = charSettings.linkedOrders;
    refreshedUser.settings = charSettings.settings;
    refreshedUser.snapshotData = JSON.parse(JSON.stringify(charSettings.jobArraySnapshot));

    updateLoadingText((prevObj) => ({
      ...prevObj,
      charDataComp: true,
      apiData: true,
    }));
    const sStatus = await serverStatus();
    
    if (sStatus) {
      refreshedUser.apiSkills = await CharacterSkills(refreshedUser);
      refreshedUser.apiJobs = await IndustryJobs(refreshedUser);
      refreshedUser.apiOrders = await MarketOrders(refreshedUser);
      refreshedUser.apiHistOrders = await HistoricMarketOrders(refreshedUser);
      refreshedUser.apiBlueprints = await BlueprintLibrary(refreshedUser);
      refreshedUser.apiTransactions = await WalletTransactions(refreshedUser);
      refreshedUser.apiJournal = await WalletJournal(refreshedUser);
    } else {
      refreshedUser.apiSkills = [];
      refreshedUser.apiJobs = [];
      refreshedUser.apiOrders = [];
      refreshedUser.apiHistOrders = [];
      refreshedUser.apiBlueprints = [];
      refreshedUser.apiTransactions = [];
      refreshedUser.apiJournal = [];
    }

    updateLoadingText((prevObj) => ({
      ...prevObj,
      apiDataComp: true,
    }));

    setJobStatus(charSettings.jobStatusArray);
    updateJobArray(charSettings.jobArraySnapshot);
    updateApiJobs(refreshedUser.apiJobs);
    const newUsersArray = [];
    newUsersArray.push(refreshedUser);
    updateUsers(newUsersArray);
    updateIsLoggedIn(true);
    logEvent(analytics, "userSignIn", {
      UID: refreshedUser.accountID,
    });
    t.stop();
    updateLoadingText((prevObj) => ({
      ...prevObj,
      eveSSO: false,
      eveSSOComp: false,
      charData: false,
      charDataComp: false,
      apiData: false,
      apiDataComp: false,
    }));
    updatePageLoad(false);
  };

  const RefreshUserAToken = async (user) => {
    try {
      const newTokenPromise = await fetch(
        "https://login.eveonline.com/v2/oauth/token",
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(
              `${process.env.REACT_APP_eveClientID}:${process.env.REACT_APP_eveSecretKey}`
            )}`,
            "Content-Type": "application/x-www-form-urlencoded",
            Host: "login.eveonline.com",
          },
          body: `grant_type=refresh_token&refresh_token=${localStorage.getItem(
            "Auth"
          )}`,
        }
      );
      const newTokenJSON = await newTokenPromise.json();

      const decodedToken = jwt.decode(newTokenJSON.access_token);

      user.aToken = newTokenJSON.access_token;
      user.aTokenEXP = Number(decodedToken.exp);

      if (user.ParentUser) {
        localStorage.setItem("Auth", newTokenJSON.refresh_token);
      } else {
        localStorage.setItem(user.CharacterHash, newTokenJSON.refresh_token);
      }

      return user;
    } catch (err) {
      console.log(err);
    }
  };

  return { RefreshUserAToken, reloadMainUser };
}

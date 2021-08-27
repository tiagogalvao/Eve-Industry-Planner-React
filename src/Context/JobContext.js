import React, { useState, createContext } from "react";

export const JobStatusContext = createContext();

export const JobStatus = (props) => {
  const [jobStatus, setJobStatus] = useState([
    { id: 0, name: "Planning" },
    { id: 1, name: "Purchasing" },
    { id: 2, name: "Building" },
    { id: 3, name: "Complete" },
    { id: 4, name: "For Sale" }
  ]);

  return (
    <JobStatusContext.Provider value={{ jobStatus, setJobStatus }}>
      {props.children}
    </JobStatusContext.Provider>
  );
};

export const JobArrayContext = createContext();

export const JobArray = (props) => {
  const [jobArray, updateJobArray] = useState([]);

  return (
    <JobArrayContext.Provider value={{jobArray, updateJobArray}}>
      {props.children}
    </JobArrayContext.Provider>
  );
};


export const ActiveJobContext = createContext();

export const ActiveJob = (props) => {
  const [activeJob, updateActiveJob] = useState({});
  
  return (
    <ActiveJobContext.Provider value={{ activeJob, updateActiveJob }}>
      {props.children}
    </ActiveJobContext.Provider>
  );
};


export const JobSettingsTriggerContext = createContext();

export const JobSettingsTrigger = (props) => {
  const [JobSettingsTrigger, ToggleJobSettingsTrigger] = useState(false);

  return (
    <JobSettingsTriggerContext.Provider value={{ JobSettingsTrigger, ToggleJobSettingsTrigger }}>
      {props.children}
    </JobSettingsTriggerContext.Provider>
  );
};
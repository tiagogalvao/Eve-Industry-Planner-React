import React from "react";
import { IndustryESICardActive } from "./Api Job Card/manufacturingCardActive";
import { IndustryESICardComplete } from "./Api Job Card/manufacturingCardComplete";
import { MeResearchESICardActive } from "./Api Job Card/meResearchActive";
import { TeResearchESICardActive } from "./Api Job Card/teResearchActive";

export function ApiJobCard({ job }) {
  if (job.activity_id === 1) {
    if (job.status === "active") {
      return <IndustryESICardActive job={job} />;
    }
    if (job.status === "delivered") {
      return <IndustryESICardComplete job={job} />;
    }
  }
  if (job.activity_id === 4) {
    if (job.status === "active") {
      return <MeResearchESICardActive job={job} />;
    } else return null;
  }
  if (job.activity_id === 3) {
    if (job.status === "active") {
      return <TeResearchESICardActive job={job} />;
    } else return null
  }
}
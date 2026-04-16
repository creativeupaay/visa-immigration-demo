import { Request, Response } from "express";
import mongoose from "mongoose";
import { VisaStepModel } from "../../models/VisaStep";
import { portugalLogMap } from "./logMaps/portugalMap";
import { dubaiLogMap } from "./logMaps/dubaiMap";
import { dominicaLogMap } from "./logMaps/dominicaMap";
import { grenadaLogMap } from "./logMaps/grenadaMap";

export const addLogTriggers = async (_req: Request, res: Response) => {

  const visaLogMap = {
    "6803644993e23a8417963620": dominicaLogMap,
    "6803644993e23a8417963621": grenadaLogMap,
    "6803644993e23a8417963622": portugalLogMap,
    "6803644993e23a8417963623": dubaiLogMap,
  };

  let matchedTotal = 0;
  let modifiedTotal = 0;
  let skippedTotal = 0;

  for (const [visaTypeId, logMap] of Object.entries(visaLogMap)) {
    const steps = await VisaStepModel.find(
      { visaTypeId },
      { stepName: 1 } // means select stepName
    ).lean();

    const bulkOps: mongoose.AnyBulkWriteOperation[] = [];

    for (const step of steps) {
      const triggers = logMap[step.stepName];
      if (!triggers) {
        console.warn(
          `No logTriggers for "${step.stepName}" in visaType ${visaTypeId}`
        );
        skippedTotal++;
        continue;
      }
      bulkOps.push({
        updateOne: {
          filter: { _id: step._id },
          update: { $set: { logTriggers: triggers } },
        },
      });
    }

    if (bulkOps.length) {
      const result = await VisaStepModel.bulkWrite(bulkOps, { ordered: false });
      matchedTotal += result.matchedCount;
      modifiedTotal += result.modifiedCount;
    }
  }

  return res.json({
    message: "LogTriggers added successfully",
    matched: matchedTotal,
    modified: modifiedTotal,
    skipped: skippedTotal,
  });
};

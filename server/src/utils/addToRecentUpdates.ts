import { RecentUpdatesModel, RecentUpdatesTypes } from "../leadModels/recentUpdatesModel";

export const addToRecentUpdates = async(data: RecentUpdatesTypes) => {
  console.log("Inside addToRecentUpdates",data)
  try {
    await RecentUpdatesModel.create({
      caseId: data.caseId,
      name: data.name,
      status: data.status,
    });
    
    const count = await RecentUpdatesModel.countDocuments();
    
    //store only 10 recent applicants
    if (count > 10) {
      await RecentUpdatesModel.findOneAndDelete({}, { sort: { _id: 1 } }); 
    }

    console.log("Visa application update added successfully.");
  } catch (error) {
    console.error("Error adding visa update:", error);
    throw error;
  }
};

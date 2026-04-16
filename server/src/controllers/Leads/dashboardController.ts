import { ConsultationModel } from "../../leadModels/consultationModel";
import { LeadModel } from "../../leadModels/leadModel";
import { RecentUpdatesModel } from "../../leadModels/recentUpdatesModel";
import { RevenueModel } from "../../leadModels/revenueModel"
import { Request, Response } from "express";
import {LogModel as logModel } from "../../models/logsModels/logModel"


// Fetch all visaType Revenue
export const getAllRevenue = async(req: Request, res: Response)=>{
    const revenue = await RevenueModel.find()

    res.status(200).json({ revenue });
}


// Fetch 5 recent updates from RecentUpdatesDB
// export const getRecentUpdates = async (req: Request, res: Response) => {
//   try {
//     const recentUpdates = await RecentUpdatesModel.find()
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .populate({
//         path: 'caseId',
//         select: 'leadId nanoVisaApplicationId', // only fetch leadId from VisaApplication
//       });

//     res.status(200).json({ updates: recentUpdates });
//   } catch (error) {
//     console.error("Error fetching recent updates:", error);
//     res.status(500).json({ message: "Error fetching recent updates" });
//   }
// };




export const getRecentUpdates = async (req: Request, res: Response) => {
  
  const LIMIT = 5;

  const logs = await logModel.aggregate([
    {
      $match: {
        visaApplicationId: { $ne: null },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $limit: LIMIT,
    },
    {
      $project: {
        _id: 1,
        logMsg: 1,
        visaApplicationId: 1,
        createdAt: 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    message: "Recent visa application logs fetched successfully",
    data: logs,
  });
};






// Fetch 5 recent leads 
export const fetchRecentLeads = async (req: Request, res: Response) => {
  const filter: any = {};

  if (Array.isArray(req.assignedIds)) {
    if (req.assignedIds.length === 0) {
      return res.status(200).json({ leads: [] });
    }
    filter._id = { $in: req.assignedIds };
  }

  const leads = await LeadModel.find(filter).sort({ createdAt: -1 }).limit(5);

  res.status(200).json({ leads });
};

//Fetch 5 recent consultations
export const fetchRecentConsultions = async (req: Request, res: Response) => {
  //  Build a $match stage 
  const match: any = {
    status: "SCHEDULED",
    startTime: { $gte: new Date() }          // only upcoming consultations
  };

  // If the middleware set req.assignedIds, filter by those IDs
  if (Array.isArray(req.assignedIds)) {
    if (req.assignedIds.length === 0) {
      return res.status(200).json({ consultations: [] });
    }
    match._id = { $in: req.assignedIds };
  }

  // Run the aggregation 
  const consultations = await ConsultationModel.aggregate([
    { $match: match },
    { $sort:  { startTime: -1 } },           // newest (closest) first
    { $limit: 5 }
  ]);

  //  Respond 
  res.status(200).json({ consultations });
};


// returns last 30 Days leads ,%conversions ,pending and completed.  
export const fetchAnalytics =  async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfRange = new Date();
    startOfRange.setDate(startOfRange.getDate() - 30);

    const leadsLast30Days = await LeadModel.find({
      createdAt: { $gte: startOfRange }
    });

    const totalLeads = leadsLast30Days.length;

    const completedApplications = leadsLast30Days.filter(
      (lead) => lead.leadStatus === "PAYMENTDONE"
    ).length;

    const pendingApplications = leadsLast30Days.filter(
      (lead) => lead.leadStatus !== "PAYMENTDONE" && lead.leadStatus !== "REJECTED"
    ).length;

    const leadConversionRate = totalLeads === 0
      ? 0
      : Math.round((completedApplications / totalLeads) * 100);

    res.status(200).json({
      newLeadsLast30Days: totalLeads,
      leadConversionRate: `${leadConversionRate}%`,
      pendingApplications,
      completedApplications
    });

  } catch (error) {
    console.error("Error fetching lead stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



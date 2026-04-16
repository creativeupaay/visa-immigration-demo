import { Request, Response, NextFunction } from "express";
import { UserModel } from "../../models/Users";
import { VisaApplicationModel } from "../../models/VisaApplication";
import { currencyConversion } from "../../services/currencyConversion/currencyConversion";
import { searchPaginatedQuery } from "../../services/searchAndPagination/searchPaginatedQuery";
import { RoleEnum } from "../../types/enums/enums";
import { streamExcelToResponse } from "../../utils/downloadExcelReport";

// API for fetchAllClients
export const fetchAllClients = async (req: Request, res: Response) => {
  const { search, page = "1", limit = "10" } = req.query;

  const additionalFilters: any = { role: RoleEnum.USER };

  if (Array.isArray(req.assignedIds)) {
    if (req.assignedIds.length === 0) {
      // Case 2: Empty assignedIds → return empty result
      return res.status(200).json({
        success: true,
        message: "Clients with visa application stats fetched successfully",
        data: [],
        pagination: {
          total: 0,
          page: Number(page),
          limit: Number(limit),
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    } else {
      // Case 3: assignedIds present → filter clients
      additionalFilters._id = { $in: req.assignedIds };
    }
  }

  const postMatchStages = [
    {
      $lookup: {
        from: "visaapplications",
        localField: "_id",
        foreignField: "userId",
        as: "applications",
      },
    },

    {
      $addFields: {
        totalApplications: { $size: "$applications" },
        completedApplications: {
          $size: {
            $filter: {
              input: "$applications",
              cond: { $eq: ["$$this.status", "COMPLETED"] },
            },
          },
        },
        pendingApplications: {
          $size: {
            $filter: {
              input: "$applications",
              cond: { $eq: ["$$this.status", "PENDING"] },
            },
          },
        },
        latestApplication: {
          $arrayElemAt: [
            {
              $sortArray: {
                input: "$applications",
                sortBy: { createdAt: -1 },
              },
            },
            0,
          ],
        },
      },
    },

    {
      $lookup: {
        from: "visatypes",
        localField: "latestApplication.visaTypeId",
        foreignField: "_id",
        as: "visaTypeInfo",
      },
    },

    {
      $lookup: {
        from: "leads",
        localField: "latestApplication.leadId",
        foreignField: "_id",
        as: "leadInfo",
      },
    },

    {
      $lookup: {
        from: "payments",
        localField: "applications.paymentId",
        foreignField: "_id",
        as: "payments",
      },
    },

    {
      $project: {
        userId: "$_id",
        name: 1,
        email: 1,
        phone: 1,
        nanoUserId: 1,
        totalApplications: 1,
        completedApplications: 1,
        pendingApplications: 1,
        caseId: "$nanoUserId",
        lastService: {
          $ifNull: [{ $arrayElemAt: ["$visaTypeInfo.visaType", 0] }, "N/A"],
        },
        startingDate: {
          $ifNull: [
            {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$latestApplication.createdAt",
              },
            },
            "N/A",
          ],
        },
        status: {
          $ifNull: ["$latestApplication.status", "N/A"],
        },
        payments: {
          $filter: {
            input: "$payments",
            cond: { $eq: ["$$this.status", "PAID"] },
          },
        },
      },
    },
  ];

  try {
    const result = await searchPaginatedQuery({
      model: UserModel,
      collectionName: "users",
      search: search as string,
      page: Number(page),
      limit: Number(limit),
      additionalFilters,
      postMatchStages,
    });

    const enrichedData = await Promise.all(
      result.data.map(async (user: any) => {
        let totalRevenue = 0;

        if (user.payments && user.payments.length > 0) {
          for (const payment of user.payments) {
            if (!payment.amount) continue;

            const currency = payment.currency?.trim().toUpperCase() || "USD";
            let amountInUSD = payment.amount;

            if (currency !== "USD") {
              const converted = await currencyConversion(
                currency,
                "USD",
                payment.amount
              );
              if (converted === null) {
                console.error(
                  `Skipping payment due to failed conversion from ${currency}`
                );
                continue;
              }
              amountInUSD = converted;
            }

            totalRevenue += amountInUSD;
          }
        }

        return {
          ...user,
          totalRevenue,
          payments: undefined,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Clients with visa application stats fetched successfully",
      data: enrichedData,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    });
  } catch (error: any) {
    console.error("Error fetching clients:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch clients",
      error: error.message,
    });
  }
};

export const handleDownloadClientsReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "Start date and end date are required" });
  }

  const filters: any = {
    role: RoleEnum.USER,
    createdAt: {
      $gte: new Date(startDate as string),
      $lte: new Date(endDate as string),
    },
  };

  if (Array.isArray(req.assignedIds) && req.assignedIds.length > 0) {
    filters._id = { $in: req.assignedIds };
  }

  try {
    const columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 20 },
      { header: "Case ID", key: "caseId", width: 20 },
      { header: "Last Service", key: "lastService", width: 20 },
      { header: "Status", key: "status", width: 20 },
      { header: "Starting Date", key: "startingDate", width: 20 },
    ];

    const result = await UserModel.aggregate([
      { $match: filters },
      {
        $lookup: {
          from: "visaapplications",
          localField: "_id",
          foreignField: "userId",
          as: "applications",
        },
      },
      {
        $addFields: {
          latestApplication: {
            $arrayElemAt: [
              {
                $sortArray: {
                  input: "$applications",
                  sortBy: { createdAt: -1 },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $lookup: {
          from: "visatypes",
          localField: "latestApplication.visaTypeId",
          foreignField: "_id",
          as: "visaTypeInfo",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          caseId: "$nanoUserId",
          lastService: {
            $ifNull: [{ $arrayElemAt: ["$visaTypeInfo.visaType", 0] }, "N/A"],
          },
          status: {
            $ifNull: ["$latestApplication.status", "N/A"],
          },
          startingDate: {
            $ifNull: [
              {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$latestApplication.createdAt",
                },
              },
              "N/A",
            ],
          },
        },
      },
    ]);

    await streamExcelToResponse({
      filename: `clients_report_${startDate}_to_${endDate}.xlsx`,
      response: res,
      sheets: [
        {
          name: "Clients Report",
          data: result,
          columns: columns,
        },
      ],
    });
  } catch (error) {
    console.error("Error downloading clients report:", error);
    return next(new Error("Failed to download clients report"));
  }
};

export const fetchClientVisaApplications = async (
  req: Request,
  res: Response
) => {
  const { userid } = req.params;

  if (!userid) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const filter: any = { userId: userid };

    if (Array.isArray(req.assignedIds)) {
      if (req.assignedIds.length === 0) {
        return res.status(200).json({ success: true, data: [] });
      }
      filter._id = { $in: req.assignedIds };
    }

    const applications = await VisaApplicationModel.find(filter).populate({
      path: "visaTypeId",
      select: "visaType",
    });

    if (!applications.length) {
      return res
        .status(404)
        .json({ message: "No visa applications found for this user" });
    }

    return res.status(200).json({ data: applications });
  } catch (error) {
    console.error("Error fetching visa applications:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

// fetch All applications of a particular client
export const getAllApplications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { clientId } = req.params;

  const applications = await VisaApplicationModel.find({
    userId: clientId,
  })
    .sort({ createdAt: -1 })
    .populate({ path: "userId" })
    .populate({ path: "visaTypeId", select: "visaType" })
    .exec();

  res.status(200).json({
    success: true,
    data: applications,
  });
};

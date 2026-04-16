import { Request, Response, NextFunction } from "express";
import { PaymentModel } from "../../../leadModels/paymentModel";
import AppError from "../../../utils/appError";
import { searchPaginatedQuery } from "../../../services/searchAndPagination/searchPaginatedQuery";
import { currencyConversion } from "../../../services/currencyConversion/currencyConversion";
import { paymentStatus } from "../../../types/enums/enums";
import { streamExcelToResponse } from "../../../utils/downloadExcelReport";

export const getAllInvoicesData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search = "", page = 1, limit = 10, statusFilter = "" } = req.query;

    const additionalFilters: any = {};

    if (statusFilter && statusFilter !== "") {
      if (statusFilter === "PENDING") {
        additionalFilters.status = "LINKSENT";
      } else {
        additionalFilters.status = statusFilter;
      }
    }

    const result = await searchPaginatedQuery({
      model: PaymentModel,
      collectionName: "payments",
      search: search as string,
      page: Number(page),
      limit: Number(limit),
      select:
        "name email amount currency status invoiceUrl paymentMethod source createdAt",
      additionalFilters,
    });

    const transformedData = result.data.map((payment: any) => ({
      ...payment,
      paymentMethod: payment.paymentMethod || "Not Specified",
      status: payment.status === "LINKSENT" ? "PENDING" : payment.status,
    }));

    res.status(200).json({
      success: true,
      data: transformedData,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    });
  } catch (error) {
    return next(new AppError("Failed to fetch invoices data", 500));
  }
};

export const handleDownloadInvoiceData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return next(new AppError("Start date and end date are required", 400));
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return next(new AppError("Invalid date format", 400));
    }

    const columns = [
      { header: "Name", key: "name" },
      { header: "Email", key: "email" },
      { header: "Amount", key: "amount" },
      { header: "Currency", key: "currency" },
      { header: "Status", key: "status" },
      { header: "Invoice URL", key: "invoiceUrl" },
      { header: "Payment Method", key: "paymentMethod" },
      { header: "Source", key: "source" },
      { header: "Created At", key: "createdAt" },
    ];

    const invoices = await PaymentModel.find({
      createdAt: { $gte: start, $lte: end },
    }).select(
      "name email amount currency status invoiceUrl paymentMethod source createdAt"
    );

    const startDateFormatted = new Date(startDate as string)
      .toISOString()
      .split("T")[0];
    const endDateFormatted = new Date(endDate as string)
      .toISOString()
      .split("T")[0];
    const filename = `invpices_report_${startDateFormatted}_to_${endDateFormatted}.xlsx`;
    await streamExcelToResponse({
      filename,
      response: res,
      sheets: [
        {
          name: "Invoices Report",
          data: invoices,
          columns,
        },
      ],
    });
  } catch (error) {
    console.error("Error downloading invoice data:", error);
    return next(new AppError("Failed to download invoice data", 500));
  }
};

export const getInvoiceStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    // Aggregate query to get revenue by currency and status counts
    const stats = await PaymentModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          // Revenue by currency
          revenueByCurrency: {
            $push: {
              $cond: [
                { $eq: ["$status", paymentStatus.PAID] },
                {
                  currency: "$currency",
                  amount: "$amount",
                },
                null,
              ],
            },
          },
          // Status counts
          linkSentCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "LINKSENT"] }, 1, 0],
            },
          },
          paidCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "PAID"] }, 1, 0],
            },
          },
          failedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          revenueByCurrency: {
            $filter: {
              input: "$revenueByCurrency",
              as: "item",
              cond: { $ne: ["$$item", null] },
            },
          },
          linkSentCount: 1,
          paidCount: 1,
          failedCount: 1,
        },
      },
    ]);

    console.log("Invoice stats:", stats);

    if (!stats || stats.length === 0) {
      res.status(200).json({
        success: true,
        data: {
          totalRevenueUSD: 0,
          linkSentCount: 0,
          paidCount: 0,
          failedCount: 0,
        },
      });
      return;
    }

    const { revenueByCurrency, linkSentCount, paidCount, failedCount } =
      stats[0];

    // Group revenue by currency
    const currencyGroups: { [key: string]: number } = {};

    revenueByCurrency.forEach((item: any) => {
      const currency = item.currency.toUpperCase();
      const amount = parseFloat(item.amount) || 0;

      if (currencyGroups[currency]) {
        currencyGroups[currency] += amount;
      } else {
        currencyGroups[currency] = amount;
      }
    });

    // Convert all currencies to USD
    let totalRevenueUSD = 0;

    for (const [currency, amount] of Object.entries(currencyGroups)) {
      if (currency === "USD") {
        totalRevenueUSD += amount;
      } else {
        try {
          const convertedAmount = await currencyConversion(
            currency,
            "USD",
            amount
          );
          totalRevenueUSD += convertedAmount || 0;
        } catch (error) {
          console.error(`Failed to convert ${currency} to USD:`, error);
          // If conversion fails, you might want to handle this differently
          // For now, we'll skip this amount
        }
      }
    }

    // Round to 2 decimal places
    totalRevenueUSD = Math.round(totalRevenueUSD * 100) / 100;

    res.status(200).json({
      success: true,
      data: {
        totalRevenueUSD,
        linkSentCount,
        paidCount,
        failedCount,
      },
    });
  } catch (error) {
    console.error("Error fetching invoice stats:", error);
    return next(new AppError("Failed to fetch invoice statistics", 500));
  }
};

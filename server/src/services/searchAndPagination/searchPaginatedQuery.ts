import { searchableFields } from "./searchableFields";

interface PopulateOption {
  path: string;
  select?: string;
  populate?: PopulateOption | PopulateOption[];
}

interface CustomField {
  name: string;
  expression: any;
}

interface CustomSort {
  [key: string]: any;
}

interface SearchPaginatedQuery {
  model: any;
  collectionName: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string | Record<string, any>;
  additionalFilters?: Record<string, any>;
  populate?: PopulateOption | PopulateOption[];
  select?: string;
  customFields?: CustomField[];
  customSort?: CustomSort;
  excludeFields?: string[];
  preMatchStages?: any[];
  postMatchStages?: any[];
}

export const searchPaginatedQuery = async ({
  model,
  collectionName,
  search = "",
  page = 1,
  limit = 10,
  sort = "-createdAt",
  additionalFilters = {},
  populate,
  select,
  customFields = [],
  customSort,
  excludeFields = [],
  preMatchStages = [],
  postMatchStages = [],
}: SearchPaginatedQuery) => {
  const skip = (page - 1) * limit;
  const searchFields = searchableFields[collectionName];

  const pipeline: any[] = [];

  if (preMatchStages.length > 0) {
    pipeline.push(...preMatchStages);
  }

  if (Object.keys(additionalFilters).length > 0) {
    pipeline.push({ $match: additionalFilters });
  }

  const lookupFields = new Set<string>();
  if (populate) {
    const populateArray = Array.isArray(populate) ? populate : [populate];
    populateArray.forEach((pop) => {
      lookupFields.add(pop.path);
    });
  }

  if (search && searchFields) {
    for (const field of searchFields) {
      if (field.includes(".")) {
        const [refField] = field.split(".");
        lookupFields.add(refField);
      }
    }
  }

  for (const field of lookupFields) {
    const refModelName = getReferencedModelName(model, field);
    if (refModelName) {
      pipeline.push({
        $lookup: {
          from: getCollectionName(refModelName),
          localField: field,
          foreignField: "_id",
          as: field,
        },
      });

      if (!isArrayReference(model, field)) {
        pipeline.push({
          $unwind: {
            path: `$${field}`,
            preserveNullAndEmptyArrays: true,
          },
        });
      }
    }
  }

  if (customFields.length > 0) {
    const addFieldsObj: Record<string, any> = {};
    customFields.forEach((field) => {
      addFieldsObj[field.name] = field.expression;
    });
    pipeline.push({ $addFields: addFieldsObj });
  }

  if (search && searchFields) {
    const searchConditions: any[] = [];

    for (const field of searchFields) {
      searchConditions.push({
        [field]: { $regex: search, $options: "i" },
      });
    }

    if (searchConditions.length > 0) {
      pipeline.push({
        $match: {
          $or: searchConditions,
        },
      });
    }
  }

  if (postMatchStages.length > 0) {
    pipeline.push(...postMatchStages);
  }

  let sortObj: Record<string, any> = {};

  if (customSort) {
    sortObj = customSort;
  } else if (typeof sort === "string") {
    if (sort.startsWith("-")) {
      sortObj[sort.substring(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }
  } else {
    sortObj = sort;
  }
  pipeline.push({ $sort: sortObj });

  const countPipeline = [...pipeline];

  if (excludeFields.length > 0) {
    const excludeObj: Record<string, number> = {};
    excludeFields.forEach((field) => {
      excludeObj[field] = 0;
    });
    countPipeline.push({ $project: excludeObj });
  }

  countPipeline.push({ $count: "total" });
  const [countResult] = await model.aggregate(countPipeline);
  const total = countResult ? countResult.total : 0;

  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  const shouldProject = select || excludeFields.length > 0;
  if (shouldProject) {
    const selectObj: Record<string, number> = {};

    if (select) {
      select.split(" ").forEach((field) => {
        if (field.startsWith("-")) {
          selectObj[field.substring(1)] = 0;
        } else {
          selectObj[field] = 1;
        }
      });
    }

    if (excludeFields.length > 0) {
      excludeFields.forEach((field) => {
        selectObj[field] = 0;
      });
    }

    pipeline.push({ $project: selectObj });
  }

  const data = await model.aggregate(pipeline);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
  };
};

function getReferencedModelName(model: any, fieldPath: string): string | null {
  try {
    const schemaPath = model.schema.paths[fieldPath];
    if (schemaPath && schemaPath.options && schemaPath.options.ref) {
      return schemaPath.options.ref;
    }

    if (schemaPath && schemaPath.schema && schemaPath.schema.paths) {
      const arrayItemPath = schemaPath.schema.paths[fieldPath];
      if (arrayItemPath && arrayItemPath.options && arrayItemPath.options.ref) {
        return arrayItemPath.options.ref;
      }
    }

    return null;
  } catch (error) {
    console.error(`Error getting referenced model for ${fieldPath}:`, error);
    return null;
  }
}

function getCollectionName(modelName: string): string {
  try {
    const mongoose = require("mongoose");
    const model = mongoose.model(modelName);
    return model.collection.name;
  } catch (error) {
    return modelName.toLowerCase() + "s";
  }
}

function isArrayReference(model: any, fieldPath: string): boolean {
  try {
    const schemaPath = model.schema.paths[fieldPath];
    return (
      schemaPath &&
      (schemaPath instanceof model.schema.constructor.Types.Array ||
        schemaPath.constructor.name === "SchemaArray")
    );
  } catch (error) {
    return false;
  }
}

export const createCustomFields = {
  statusOrder: (statusPriority: Record<string, number>) => ({
    name: "statusOrder",
    expression: {
      $switch: {
        branches: Object.entries(statusPriority).map(([status, order]) => ({
          case: { $eq: ["$status", status] },
          then: order,
        })),
        default: 999,
      },
    },
  }),

  timeSort: (timeField: string, condition?: any) => ({
    name: "sortTime",
    expression: condition
      ? {
          $cond: {
            if: condition,
            then: { $multiply: [-1, { $toLong: `$${timeField}` }] },
            else: { $toLong: `$${timeField}` },
          },
        }
      : { $toLong: `$${timeField}` },
  }),

  dateRange: (dateField: string, rangeName: string = "dateRange") => ({
    name: rangeName,
    expression: {
      $switch: {
        branches: [
          {
            case: { $gte: [`$${dateField}`, new Date(Date.now())] },
            then: "future",
          },
          {
            case: {
              $gte: [
                `$${dateField}`,
                new Date(Date.now() - 24 * 60 * 60 * 1000),
              ],
            },
            then: "today",
          },
          {
            case: {
              $gte: [
                `$${dateField}`,
                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              ],
            },
            then: "week",
          },
        ],
        default: "older",
      },
    },
  }),
};

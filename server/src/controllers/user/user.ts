import { NextFunction, Request, Response } from "express";
import { UserModel as userModel } from "../../models/Users";
import { CustomFieldModel as customFieldModel } from "../../models/customFields";
import  {UserProfileModel as userProfileModel}  from "../../models/userProfile";

export const userProfile= async(
    req:Request, 
    res:Response,
    next:NextFunction
):Promise<Response| void>=>{

}




export const editProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  // Get all custom fields from DB
  const customFields = await customFieldModel.find({});
  const customFieldNames = customFields.map(f => f.fieldName);

  // customUpdates is a map 
  const customUpdates: Record<string, any> = {};

  for (const field of customFieldNames) {
    if (req.body[field] !== undefined) {
      customUpdates[field] = req.body[field];
    }
  }

  // Update UserProfileModel (custom fields)
  const existingProfile = await userProfileModel.findOne({ user: userId });

  if (existingProfile) {
    // Update existing profileData
    existingProfile.profileData = { ...existingProfile.profileData, ...customUpdates };
    await existingProfile.save();
  }
  else {
    // Create new profileData
    await userProfileModel.create({
      user: userId,
      profileData: customUpdates
    });
  }

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully"
  });
};


// fetch userProfile 
export const fetchUserProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const user = await userModel.findById(userId).select("name email phone nationality");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const userProfile = await userProfileModel.findOne({ userId: userId }).lean();

  res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    data: {
      user,
      userProfile: userProfile?.profileData || {},
    },
  });
};


// add customFields
export const addCustomField = async (req: Request, res: Response) => {
  const { fieldName, fieldType, options } = req.body;

  const alreadyExists = await customFieldModel.findOne({ fieldName });
  if (alreadyExists) {
    res.status(400);
    throw new Error("Custom field already exists");
  }

  const newField = await customFieldModel.create({
    fieldName,
    fieldType,
    options: options || []
  });

  res.status(201).json({
    success: true,
    message: "Custom field added successfully",
    field: newField,
  });
};

// fetch customFields
export const fetchCustomFields = async (req: Request, res: Response) => {
  const fields = await customFieldModel.find().lean();

  res.status(200).json({
    success: true,
    fields,
  });
};

import { Request, Response, NextFunction } from "express";
import mongoose, { Schema, Document, Types } from "mongoose";
import { ActionModel } from "../models/rbacModels/actionModel";
import { PermissionModel } from "../models/rbacModels/permissionModel";

type RBACRequestProps =
  | "readAllLeads"
  | "readAllVisaApplications"
  | "writeOnAllLeads"
  | "writeOnAllVisaApplications"

  | "isViewAllLeads"
  | "isViewAllConsultations"
  | "isViewAllClients"
  | "isViewAllVisaApplications";


// Abhi toh fetch Upcoming taks fetch karna baaki hai (Special case se handle karna padega )
export const checkPermission = (actionName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const roleId = req.user?.roleId || req.admin?.roleId;

    // Allow all access for customer routes
    if (req.user) {
      return next();
    }

    if (!roleId) {
      res.status(401).json({ message: "User role not found in permission middleware" });
      return;
    }

    const roleObjectId = new Types.ObjectId(roleId);
    console.log("Role ID in permission middleware:", roleObjectId);

    // Check fallback: All_Actions
    const allAction = await ActionModel.findOne({ action: "All_Actions" });
    console.log("allAction:", allAction);
    let hasAllAccess = false;
    if (allAction) {
      const allAccess = await PermissionModel.findOne({
        roleId: roleObjectId,
        actionId: allAction._id,
      });
      console.log("allAccess:", allAccess);
      if (allAccess) {
        hasAllAccess = true;
      }
    }

    // Special cases mapping
    const specialCases: Record<string, {
      action1: string;
      action2: string;
      reqProp: RBACRequestProps;
    }> = {
      "Read-L": {
        action1: "ReadAllLeads",
        action2: "ReadOnlyAssignedLeads",
        reqProp: "readAllLeads",
      },
      "Read-V": {
        action1: "ReadAllVisaApplications",
        action2: "ReadOnlyAssignedVisaApplications",
        reqProp: "readAllVisaApplications",
      },
      "Write-L": {
        action1: "WriteOnAllLeads",
        action2: "WriteOnAssignedLeads",
        reqProp: "writeOnAllLeads",
      },
      "Write-V": {
        action1: "WriteOnAllVisaApplications",
        action2: "WriteOnAssignedVisaApplications",
        reqProp: "writeOnAllVisaApplications",
      },
      "View-Leads": {
        action1: "View_All_Leads",
        action2: "View_Only_Assigned_Leads",
        reqProp: "isViewAllLeads",
      },
      "View-Consultations": {
        action1: "View_All_Consultations",
        action2: "View_Only_Assigned_Consultations",
        reqProp: "isViewAllConsultations",
      },
      "View-Clients": {
        action1: "View_All_Clients",
        action2: "View_Only_Assigned_Clients",
        reqProp: "isViewAllClients",
      },
      "View-VisaApplications": {
        action1: "View_All_VisaApplications",
        action2: "View_Only_Assigned_Applications",
        reqProp: "isViewAllVisaApplications",
      },
    };

    if (specialCases[actionName]) {
      const { action1, action2, reqProp } = specialCases[actionName];
      if (hasAllAccess) {
        req[reqProp] = true;
        return next();
      }

      const [actionDoc1, actionDoc2] = await Promise.all([
        ActionModel.findOne({ action: action1 }),
        ActionModel.findOne({ action: action2 }),
      ]);

      const [perm1, perm2] = await Promise.all([
        actionDoc1
          ? PermissionModel.findOne({ roleId: roleObjectId, actionId: actionDoc1._id })
          : null,
        actionDoc2
          ? PermissionModel.findOne({ roleId: roleObjectId, actionId: actionDoc2._id })
          : null,
      ]);

      if (perm1) {
        req[reqProp] = true;
        return next();
      } else if (perm2) {
        req[reqProp] = false;
        return next();
      } else {
        res.status(403).json({ message: "Access Denied (No specific permissions)" });
        return ;
      }
    }

    // Generic action check for other cases
    if (hasAllAccess) {
      return next();
    }

    const action = await ActionModel.findOne({ action: actionName });
    if (!action) {
       res.status(404).json({ message: "Action not found" });
       return;
    }

    const permission = await PermissionModel.findOne({
      roleId: roleObjectId,
      actionId: action._id,
    });

    if (permission) {
      return next();
    }

    

    res.status(403).json({ message: "Access Denied" });
    return ;
  };
};

















// export const checkPermission = (actionName: string) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     const roleId = req.user?.roleId || req.admin?.roleId;

//     // In case of common routes of VisaApplications(For making accessible to Customers also)
//     if(req.user){
//       return next ();
//     }

//     if (!roleId) {
//        res.status(401).json({ message: "User role not found in permission middleware" });
//        return;
//     }

//     const action = await ActionModel.findOne({ action: actionName });
//     if (!action) {
//        res.status(404).json({ message: "Action not found" });
//        return;
//     }

//     const roleObjectId = new Types.ObjectId(roleId);

//     // First check for specific permission
//     const permission = await PermissionModel.findOne({
//       roleId: roleObjectId,
//       actionId: action._id,
//     });

//     if (permission) {
//       return next();
//     }

//     // Then check for "All_Actions" fallback permission
//     const allAction = await ActionModel.findOne({ action: "All_Actions" });

//     if (allAction) {
//       const hasAllAccess = await PermissionModel.findOne({
//         roleId: roleObjectId,
//         actionId: allAction._id,
//       });

//       if (hasAllAccess) {
//         return next();
//       }
//     }

//     res.status(403).json({ message: "Access Denied" });
//     return ;
//   };
// };

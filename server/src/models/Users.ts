import mongoose, { Schema, Document , Types } from "mongoose";
import { AccountStatusEnum, RoleEnum } from "../types/enums/enums";
import { generateShortId } from "../utils/generateShortId";


export interface IUser extends Document {
  name:string;
  email: string;
  phone: string;
  nationality : string;
  password: string;
  refreshToken: string;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date;
  UserStatus: AccountStatusEnum;
  role: RoleEnum;
  forgotPasswordToken: string | null;
  forgotPasswordExpires: Date | null;
  nanoUserId : string;
  // roleId: Types.ObjectId | null;
  roleId: Types.ObjectId ;
  employeeId : string | null;

  otp?: string | null;
  otpExpiry?: Date | null;
}

const UserSchema: Schema = new Schema <IUser> ({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  nationality : {type: String},
  password: { type: String, required: true },
  UserStatus: {
    type: String,
    enum: Object.values(AccountStatusEnum),
    required: true,
    default: AccountStatusEnum.ACTIVE
  },
  refreshToken: { type: String },
  forgotPasswordToken: { type: String, default: null },
  forgotPasswordExpires: { type: Date },
  role: {
    type: String,
    enum: Object.values(RoleEnum),
    required: true
  } , 
  nanoUserId: {
    type: String,     //optional
    unique: true,
    // required: true,
  } , 
  roleId: { 
    type: Schema.Types.ObjectId,    
    ref: "Role", 
    required: true
  },
  employeeId: {
    type: String,     
    unique: true,
    default : null
  },
  otp: { 
    type: String, 
    default: null 
  },
  otpExpiry: { 
    type: Date, 
    default: null 
  },

},
{
  timestamps: true
});


// Pre save hook 
UserSchema.pre("save", async function (next) {
  const user = this ;

  if (user.isNew) {
    let nanoUserId;
    let exists = true;

    do {
      // Using dynamic import for nanoid
      // const { nanoid } = await import('nanoid');
      // const shortId = nanoid(6).toUpperCase(); // e.g., A7C8X9

      const shortId=generateShortId(6)
      const year = new Date().getFullYear();
      nanoUserId = `E360-L-${shortId}`;

      const existing = await UserModel.exists({ nanoUserId });
      exists = existing !== null;
    } while (exists);

    user.nanoUserId = nanoUserId;
  }

  next();
});

// Pre-save hook for generating employeeId for ADMIN users
UserSchema.pre("save", async function (next) {
  const user = this;

  if (user.isNew && user.role === RoleEnum.ADMIN) {
    let employeeId;
    let exists = true;

    do {
      const shortId = generateShortId(6); // e.g., B9D2Y4
      employeeId = `E360-E-${shortId}`;

      const existing = await UserModel.exists({ employeeId });
      exists = existing !== null;
    } while (exists);

    user.employeeId = employeeId;
  } else if (user.isNew && user.role !== RoleEnum.ADMIN) {
    user.employeeId = null; // Ensure employeeId remains null for non-ADMIN users
  }

  next();
});

export const UserModel = mongoose.model<IUser>("User", UserSchema);










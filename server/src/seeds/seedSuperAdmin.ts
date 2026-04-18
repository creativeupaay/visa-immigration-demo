import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { UserModel } from "../models/Users";
import { RoleModel } from "../models/rbacModels/roleModel";
import { RoleEnum, AccountStatusEnum } from "../types/enums/enums";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/visademo";

// Define roles to be seeded
const ROLES = [
  { roleName: "Super Admin", isEditable: false },
  { roleName: "Admin", isEditable: true },
  { roleName: "Manager", isEditable: true },
  { roleName: "Staff", isEditable: true },
  { roleName: "Customer", isEditable: true },
];

// Superadmin user details - these can be customized
const SUPERADMIN_USER = {
  name: "Super Administrator",
  email: "superadmin@visademo.com",
  phone: "+1234567890",
  nationality: "USA",
  password: "SuperAdmin@123", // Change this in production
  role: RoleEnum.ADMIN, // This will be assigned the Super Admin role
};

const seedSuperAdmin = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected successfully");

    // Step 1: Create/Seed Roles
    console.log("\n📝 Seeding roles...");
    const createdRoles: any = {};

    for (const roleData of ROLES) {
      const existingRole = await RoleModel.findOne({ roleName: roleData.roleName });

      if (existingRole) {
        createdRoles[roleData.roleName] = existingRole._id;
        console.log(`⏭️  Role already exists: ${roleData.roleName}`);
      } else {
        const newRole = await RoleModel.create(roleData);
        createdRoles[roleData.roleName] = newRole._id;
        console.log(`✅ Created role: ${roleData.roleName}`);
      }
    }

    // Step 2: Create Superadmin User
    console.log("\n👤 Creating superadmin user...");

    const existingUser = await UserModel.findOne({ email: SUPERADMIN_USER.email });

    if (existingUser) {
      console.log(`⏭️  User already exists: ${SUPERADMIN_USER.email}`);
      console.log("\n✅ Seed completed - Superadmin user already exists");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(SUPERADMIN_USER.password, 10);

    // Get Super Admin role ID
    const superAdminRoleId = createdRoles["Super Admin"];

    if (!superAdminRoleId) {
      throw new Error("Super Admin role not found");
    }

    // Create superadmin user
    const superadminUser = await UserModel.create({
      name: SUPERADMIN_USER.name,
      email: SUPERADMIN_USER.email,
      phone: SUPERADMIN_USER.phone,
      nationality: SUPERADMIN_USER.nationality,
      password: hashedPassword,
      role: SUPERADMIN_USER.role,
      roleId: superAdminRoleId,
      UserStatus: AccountStatusEnum.ACTIVE,
    });

    console.log(`✅ Superadmin user created successfully`);
    console.log(`\n📋 Superadmin Details:`);
    console.log(`   Email: ${superadminUser.email}`);
    console.log(`   Name: ${superadminUser.name}`);
    console.log(`   Role: Super Admin`);
    console.log(`   Status: ${superadminUser.UserStatus}`);

    console.log("\n✅ Seed completed successfully!");
    console.log("\n🔐 Login Credentials:");
    console.log(`   Email: ${SUPERADMIN_USER.email}`);
    console.log(`   Password: ${SUPERADMIN_USER.password}`);
    console.log("\n⚠️  IMPORTANT: Change the password after first login in production!");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Seed failed:", error.message);
    console.error(error);
    process.exit(1);
  }
};

seedSuperAdmin();

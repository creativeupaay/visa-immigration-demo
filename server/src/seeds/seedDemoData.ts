import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { ConsultationModel } from "../leadModels/consultationModel";
import { LeadDominicaModel } from "../leadModels/dominicaModel";
import { LeadDubaiModel } from "../leadModels/dubaiModel";
import { LeadGrenadaModel } from "../leadModels/grenadaModel";
import { LeadModel } from "../leadModels/leadModel";
import { MonthlyLeadStats } from "../leadModels/leadStatsModel";
import { PaymentModel } from "../leadModels/paymentModel";
import { LeadPortugalModel } from "../leadModels/portugalModel";
import { RecentUpdatesModel } from "../leadModels/recentUpdatesModel";
import { RevenueModel } from "../leadModels/revenueModel";
import { LogModel } from "../models/logsModels/logModel";
import { MessageModel } from "../models/chatModels/msgModel";
import { RoleModel } from "../models/rbacModels/roleModel";
import { TaskModel } from "../models/teamAndTaskModels/taskModel";
import { UserModel } from "../models/Users";
import { VisaApplicationModel } from "../models/VisaApplication";
import { VisaApplicationReqStatusModel } from "../models/VisaApplicationReqStatus";
import { VisaApplicationStepStatusModel } from "../models/VisaApplicationStepStatus";
import { VisaStepModel } from "../models/VisaStep";
import { VisaStepRequirementModel } from "../models/VisaStepRequirement";
import { VisaTypeModel } from "../models/VisaType";
import {
  AccountStatusEnum,
  consultationStatus,
  leadPriority,
  leadStatus,
  logTypeEnum,
  messageTypeEnum,
  paymentStatus,
  PaymentSourceEnum,
  QuestionTypeEnum,
  reqCategoryEnum,
  RoleEnum,
  senderTypeEnum,
  StepStatusEnum,
  StepTypeEnum,
  taskPriorityEnum,
  taskStatusEnum,
  visaApplicationReqStatusEnum,
  VisaApplicationStatusEnum,
  VisaTypeEnum,
} from "../types/enums/enums";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/visaflow";
const TARGETS = {
  leads: 140,
  consultations: 90,
  payments: 120,
  visaApplications: 70,
  messages: 420,
  tasks: 85,
  logs: 520,
  recentUpdates: 110,
  monthsOfStats: 18,
};

const firstNames = [
  "Aarav",
  "Isha",
  "Rohan",
  "Meera",
  "Kabir",
  "Anaya",
  "Vivaan",
  "Naina",
  "Arjun",
  "Sara",
  "Reyansh",
  "Tara",
];

const lastNames = [
  "Sharma",
  "Patel",
  "Rao",
  "Kapoor",
  "Verma",
  "Mehta",
  "Singh",
  "Nair",
  "Iyer",
  "Chopra",
  "Malhotra",
  "Bose",
];

const nationalities = [
  "India",
  "UAE",
  "Canada",
  "UK",
  "South Africa",
  "Singapore",
  "Qatar",
  "Australia",
  "USA",
  "Kenya",
];

const ADMIN_USERS = [
  {
    name: "Demo Admin",
    email: "demo.admin@visaflow.com",
    phone: "+971500001001",
    nationality: "UAE",
  },
  {
    name: "Case Manager",
    email: "case.manager@visaflow.com",
    phone: "+971500001002",
    nationality: "India",
  },
];

const CUSTOMER_USERS = [
  {
    name: "Priya Khanna",
    email: "priya.khanna@visaflow-demo.com",
    phone: "+919910001001",
    nationality: "India",
  },
  {
    name: "Ahmed Nasser",
    email: "ahmed.nasser@visaflow-demo.com",
    phone: "+971527771001",
    nationality: "UAE",
  },
  {
    name: "Elena Martins",
    email: "elena.martins@visaflow-demo.com",
    phone: "+351911000100",
    nationality: "Portugal",
  },
  {
    name: "Daniel Brooks",
    email: "daniel.brooks@visaflow-demo.com",
    phone: "+447700900100",
    nationality: "UK",
  },
  {
    name: "Fatima Noor",
    email: "fatima.noor@visaflow-demo.com",
    phone: "+97455001001",
    nationality: "Qatar",
  },
  {
    name: "Ritika Sen",
    email: "ritika.sen@visaflow-demo.com",
    phone: "+918880001001",
    nationality: "India",
  },
];

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomDateWithinDays = (daysBack: number, daysAhead = 0): Date => {
  const now = Date.now();
  const min = now - daysBack * 24 * 60 * 60 * 1000;
  const max = now + daysAhead * 24 * 60 * 60 * 1000;
  return new Date(randomInt(min, max));
};

const slug = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const visaTypeFromLead = (leadDoc: any): VisaTypeEnum => {
  if (leadDoc.__t === "LeadDubai") return VisaTypeEnum.DUBAI;
  if (leadDoc.__t === "LeadPortugal") return VisaTypeEnum.PORTUGAL;
  if (leadDoc.__t === "LeadDominica") return VisaTypeEnum.DOMINICA;
  if (leadDoc.__t === "LeadGrenada") return VisaTypeEnum.GRENADA;
  return VisaTypeEnum.DUBAI;
};

const ensureRoles = async () => {
  const superAdminRole = await RoleModel.findOneAndUpdate(
    { roleName: "Super Admin" },
    { $setOnInsert: { roleName: "Super Admin", isEditable: false } },
    { upsert: true, new: true }
  );

  const customerRole = await RoleModel.findOneAndUpdate(
    { roleName: "Customer" },
    { $setOnInsert: { roleName: "Customer", isEditable: true } },
    { upsert: true, new: true }
  );

  return { superAdminRole, customerRole };
};

const ensureUsers = async (superAdminRoleId: mongoose.Types.ObjectId, customerRoleId: mongoose.Types.ObjectId) => {
  const passwordHash = await bcrypt.hash("Demo@123", 10);
  const created: any[] = [];

  const upsertUser = async (
    payload: {
      name: string;
      email: string;
      phone: string;
      nationality: string;
    },
    role: RoleEnum,
    roleId: mongoose.Types.ObjectId
  ) => {
    const existingUser = await UserModel.findOne({ email: payload.email });

    if (existingUser) {
      existingUser.name = payload.name;
      existingUser.phone = payload.phone;
      existingUser.nationality = payload.nationality;
      existingUser.password = passwordHash;
      existingUser.role = role;
      existingUser.roleId = roleId;
      existingUser.UserStatus = AccountStatusEnum.ACTIVE;
      await existingUser.save();
      return existingUser;
    }

    return UserModel.create({
      ...payload,
      password: passwordHash,
      role,
      roleId,
      UserStatus: AccountStatusEnum.ACTIVE,
    });
  };

  for (const admin of ADMIN_USERS) {
    const user = await upsertUser(admin, RoleEnum.ADMIN, superAdminRoleId);
    created.push(user);
  }

  for (const customer of CUSTOMER_USERS) {
    const user = await upsertUser(customer, RoleEnum.USER, customerRoleId);
    created.push(user);
  }

  return created;
};

const ensureVisaTypes = async () => {
  const visaTypes = [
    VisaTypeEnum.DUBAI,
    VisaTypeEnum.DOMINICA,
    VisaTypeEnum.GRENADA,
    VisaTypeEnum.PORTUGAL,
  ];

  const docs = [] as any[];
  for (const visaType of visaTypes) {
    const doc = await VisaTypeModel.findOneAndUpdate(
      { visaType },
      { $setOnInsert: { visaType } },
      { upsert: true, new: true }
    );
    docs.push(doc);
  }
  return docs;
};

const buildLeadPayload = (index: number) => {
  const firstName = pick(firstNames);
  const lastName = pick(lastNames);
  const fullName = `${firstName} ${lastName}`;
  const visaType = ["Dubai", "Portugal", "Dominica", "Grenada"][index % 4];
  const statusPool = [
    leadStatus.INITIATED,
    leadStatus.CONSULTATIONLINKSENT,
    leadStatus.CONSULTATIONSCHEDULED,
    leadStatus.CONSULTATIONDONE,
    leadStatus.PAYMENTLINKSENT,
    leadStatus.PAYMENTDONE,
    leadStatus.REJECTED,
  ];

  const base = {
    formId: `DEMO-FORM-${visaType.toUpperCase()}`,
    fullName,
    nationality: pick(nationalities),
    email: `${slug(firstName)}.${slug(lastName)}.${Date.now()}${index}@visaflow-lead-demo.com`,
    phone: `+91${randomInt(7000000000, 9999999999)}`,
    leadStatus: pick(statusPool),
  };

  if (visaType === "Dubai") {
    return {
      model: LeadDubaiModel,
      payload: {
        ...base,
        additionalInfo: {
          profession: "Business Owner / Entrepreneur",
          businessOwner: {
            registeredBusiness: "Yes, my business is legally registered",
            annualRevenue: "$200,000 – $500,000",
            relocationPlan: "Yes, I plan to relocate",
          },
          mainGoal: ["Establishing a new business", "Investment opportunities in Dubai"],
          budgetRange: "$10,000 – $30,000",
          movingToDubai: "I’m considering it and need more info",
          visaIssues: "No, my record is clear",
          extraInfo: "Interested in mainland setup with 3 visas in year one.",
          priority: pick([leadPriority.HIGH, leadPriority.MEDIUM, leadPriority.LOW]),
        },
      },
    };
  }

  if (visaType === "Portugal") {
    return {
      model: LeadPortugalModel,
      payload: {
        ...base,
        additionalInfo: {
          profession: "Remote Worker",
          remoteWorker: {
            monthlyIncomeFromRemoteWork: "€5,000+",
            isSavingsInvestmentAvailable: "Yes",
          },
          incomeSources: ["Salary", "Investment Returns"],
          monthlyIncomeRange: "Above €4,000",
          financialStatements: "Yes, complete records",
          sufficientSavingsFor12Months: "Yes, at least €10,000+ in savings",
          legalResidency: "Yes, legally documented",
          otherCitizenship: "No second passport & restricted mobility",
          housingPlan: "Undecided but open to it",
          stayDuration: "More than 183 days per year",
          dependents: "1–4 dependents (with financial means)",
          extraInfo: "Planning relocation in Q3 with spouse.",
          priority: pick([leadPriority.HIGH, leadPriority.MEDIUM, leadPriority.LOW]),
        },
      },
    };
  }

  const citizenshipPayload = {
    ...base,
    additionalInfo: {
      profession: "Investor",
      investor: {
        readyToInvest: "Yes, I have at least $150,000 available",
        investmentRoute: "Real Estate Investment ($200,000+)",
      },
      mainGoal: "Securing second citizenship for travel/business opportunities",
      budgetRange: "$150,000+",
      movingToApply: "Yes, I’m ready",
      visaIssues: "No, my record is clear",
      extraInfo: "Family application for 4 members.",
      priority: pick([leadPriority.HIGH, leadPriority.MEDIUM, leadPriority.LOW]),
    },
  };

  if (visaType === "Dominica") {
    return { model: LeadDominicaModel, payload: citizenshipPayload };
  }

  return { model: LeadGrenadaModel, payload: citizenshipPayload };
};

const seedLeads = async () => {
  const existing = await LeadModel.countDocuments();
  const toCreate = Math.max(0, TARGETS.leads - existing);

  if (toCreate === 0) {
    return;
  }

  for (let i = 0; i < toCreate; i += 1) {
    const { model, payload } = buildLeadPayload(i);
    await (model as any).create(payload);
  }
};

const seedConsultations = async (leadDocs: any[]) => {
  const existing = await ConsultationModel.countDocuments();
  const toCreate = Math.max(0, TARGETS.consultations - existing);

  if (toCreate === 0 || leadDocs.length === 0) {
    return;
  }

  const batch = [] as any[];
  for (let i = 0; i < toCreate; i += 1) {
    const lead = pick(leadDocs);
    const isCompleted = i % 2 === 0;
    const start = isCompleted ? randomDateWithinDays(120, 0) : randomDateWithinDays(0, 30);
    const end = new Date(start.getTime() + 45 * 60 * 1000);

    batch.push({
      name: lead.fullName,
      email: lead.email,
      status: isCompleted ? consultationStatus.COMPLETED : consultationStatus.SCHEDULED,
      startTime: start,
      endTime: end,
      joinUrl: `https://meet.visaflow-demo.com/room/${lead._id}-${i}`,
      calendlyEventUrl: `https://calendly.com/visaflow-demo/event/${lead._id}-${i}`,
      rescheduleUrl: `https://calendly.com/visaflow-demo/reschedule/${lead._id}-${i}`,
      formattedDate: start.toDateString(),
      leadId: lead._id,
    });
  }

  await ConsultationModel.insertMany(batch);
};

const seedPayments = async (leadDocs: any[]) => {
  const existing = await PaymentModel.countDocuments();
  const toCreate = Math.max(0, TARGETS.payments - existing);

  if (toCreate === 0 || leadDocs.length === 0) {
    return;
  }

  const statuses = [
    paymentStatus.PAID,
    paymentStatus.PENDING,
    paymentStatus.LINKSENT,
    paymentStatus.FAILED,
    paymentStatus.PAID,
    paymentStatus.PAID,
  ];

  const currencies = ["usd", "eur", "inr"];
  const methods = ["card", "bank_transfer", "upi"];
  const batch = [] as any[];

  for (let i = 0; i < toCreate; i += 1) {
    const lead = pick(leadDocs);
    const status = statuses[i % statuses.length];
    const amount = randomInt(1500, 15000);

    batch.push({
      leadId: lead._id,
      name: lead.fullName,
      email: lead.email,
      amount,
      currency: pick(currencies),
      paymentMethod: pick(methods),
      status,
      paymentLink: `https://pay.visaflow-demo.com/${lead._id}-${i}`,
      invoiceUrl:
        status === paymentStatus.PAID
          ? `https://invoices.visaflow-demo.com/invoice-${lead._id}-${i}.pdf`
          : null,
      paymentIntentId:
        status === paymentStatus.PAID || status === paymentStatus.PENDING
          ? `pi_demo_${Date.now()}_${i}`
          : null,
      source: pick([PaymentSourceEnum.STRIPE, PaymentSourceEnum.DIRECT]),
      createdAt: randomDateWithinDays(140),
      updatedAt: randomDateWithinDays(60),
    });
  }

  await PaymentModel.insertMany(batch);
};

const ensureVisaStepsAndRequirements = async (visaTypeDocs: any[]) => {
  const stepBlueprint = [
    { name: "Profile & Eligibility", type: StepTypeEnum.GENERAL },
    { name: "Document Upload", type: StepTypeEnum.GENERAL },
    { name: "Payment Verification", type: StepTypeEnum.DUBAI_PAYMENT },
    { name: "Final Review", type: StepTypeEnum.STATUSUPDATE },
  ];

  const requirementBlueprint = [
    { question: "Passport Copy", requirementType: QuestionTypeEnum.PDF, options: [] },
    { question: "Latest Photograph", requirementType: QuestionTypeEnum.IMAGE, options: [] },
    { question: "Current Address", requirementType: QuestionTypeEnum.TEXT, options: [] },
    { question: "Marital Status", requirementType: QuestionTypeEnum.DROPDOWN, options: ["Single", "Married"] },
  ];

  for (const visaType of visaTypeDocs) {
    const existingSteps = await VisaStepModel.find({ visaTypeId: visaType._id });
    if (existingSteps.length === 0) {
      const createdSteps = await VisaStepModel.insertMany(
        stepBlueprint.map((item, idx) => ({
          visaTypeId: visaType._id,
          stepName: item.name,
          stepNumber: idx + 1,
          stepType: item.type,
          inProgressMessage: `${item.name} is being processed by your case team.`,
        }))
      );

      const reqDocs = [] as any[];
      for (const step of createdSteps) {
        requirementBlueprint.forEach((req) => {
          reqDocs.push({
            visaTypeId: visaType._id,
            visaStepId: step._id,
            question: req.question,
            requirementType: req.requirementType,
            required: true,
            options: req.options,
            reqCategory: reqCategoryEnum.GENRAL,
          });
        });
      }
      await VisaStepRequirementModel.insertMany(reqDocs);
    }
  }
};

const seedVisaApplications = async (users: any[], visaTypes: any[]) => {
  const existing = await VisaApplicationModel.countDocuments();
  const toCreate = Math.max(0, TARGETS.visaApplications - existing);

  if (toCreate === 0 || users.length === 0 || visaTypes.length === 0) {
    return;
  }

  const customerUsers = users.filter((u) => u.role === RoleEnum.USER);
  const leads = await LeadModel.find().limit(200).lean();
  const paidPayments = await PaymentModel.find({ status: paymentStatus.PAID }).limit(200).lean();

  for (let i = 0; i < toCreate; i += 1) {
    const lead = pick(leads);
    const user = pick(customerUsers.length > 0 ? customerUsers : users);

    let payment: any = paidPayments.find((p) => String(p.leadId) === String(lead._id));
    if (!payment) {
      const createdPayment = await PaymentModel.create({
        leadId: lead._id,
        name: lead.fullName,
        email: lead.email,
        amount: randomInt(3000, 12000),
        currency: "usd",
        paymentMethod: "card",
        status: paymentStatus.PAID,
        paymentLink: `https://pay.visaflow-demo.com/manual-${lead._id}-${i}`,
        invoiceUrl: `https://invoices.visaflow-demo.com/manual-${lead._id}-${i}.pdf`,
        paymentIntentId: `pi_manual_${Date.now()}_${i}`,
        source: PaymentSourceEnum.STRIPE,
      });
      payment = createdPayment as any;
      paidPayments.push(payment as any);
    }

    if (!payment) {
      continue;
    }

    const desiredVisaType = visaTypeFromLead(lead);
    const visaType =
      visaTypes.find((v) => v.visaType === desiredVisaType) || pick(visaTypes);

    await VisaApplicationModel.create({
      userId: user._id,
      visaTypeId: visaType._id,
      leadId: lead._id,
      currentStep: randomInt(1, 4),
      status: pick([
        VisaApplicationStatusEnum.PENDING,
        VisaApplicationStatusEnum.IN_PROGRESS,
        VisaApplicationStatusEnum.COMPLETED,
      ]),
      paymentId: payment._id,
      createdAt: randomDateWithinDays(150),
      updatedAt: randomDateWithinDays(15),
    });
  }
};

const seedVisaStatuses = async () => {
  const visaApplications = await VisaApplicationModel.find().limit(100).lean();

  for (const app of visaApplications) {
    const existingStepStatuses = await VisaApplicationStepStatusModel.find({ visaApplicationId: app._id }).lean();
    if (existingStepStatuses.length > 0) {
      continue;
    }

    const steps = await VisaStepModel.find({ visaTypeId: app.visaTypeId }).sort({ stepNumber: 1 }).lean();
    const reqs = await VisaStepRequirementModel.find({ visaTypeId: app.visaTypeId }).lean();

    if (steps.length === 0 || reqs.length === 0) {
      continue;
    }

    const stepStatusDocs = steps.map((step, index) => ({
      userId: app.userId,
      visaTypeId: app.visaTypeId,
      stepId: step._id,
      visaApplicationId: app._id,
      status:
        index < app.currentStep - 1
          ? StepStatusEnum.APPROVED
          : index === app.currentStep - 1
            ? StepStatusEnum.IN_PROGRESS
            : StepStatusEnum.SUBMITTED,
      reqFilled: {},
    }));

    const insertedStepStatuses = await VisaApplicationStepStatusModel.insertMany(stepStatusDocs);

    const reqStatusDocs = [] as any[];
    for (const stepStatus of insertedStepStatuses) {
      const reqsForStep = reqs.filter((r) => String(r.visaStepId) === String(stepStatus.stepId));
      reqsForStep.forEach((req, reqIndex) => {
        reqStatusDocs.push({
          userId: app.userId,
          visaTypeId: app.visaTypeId,
          visaApplicationId: app._id,
          reqId: req._id,
          stepStatusId: stepStatus._id,
          stepId: stepStatus.stepId,
          status:
            reqIndex % 3 === 0
              ? visaApplicationReqStatusEnum.VERIFIED
              : reqIndex % 3 === 1
                ? visaApplicationReqStatusEnum.UPLOADED
                : visaApplicationReqStatusEnum.NOT_UPLOADED,
          value: req.requirementType === QuestionTypeEnum.TEXT ? "Submitted by client" : null,
          reason: null,
        });
      });
    }

    if (reqStatusDocs.length > 0) {
      await VisaApplicationReqStatusModel.insertMany(reqStatusDocs);
    }
  }
};

const seedMessages = async () => {
  const existing = await MessageModel.countDocuments();
  const toCreate = Math.max(0, TARGETS.messages - existing);

  if (toCreate === 0) {
    return;
  }

  const apps = await VisaApplicationModel.find().limit(80).lean();
  const users = await UserModel.find().limit(50).lean();
  if (apps.length === 0 || users.length === 0) {
    return;
  }

  const messages = [] as any[];
  for (let i = 0; i < toCreate; i += 1) {
    const app = pick(apps);
    const sender = pick(users);
    const textSamples = [
      "Uploaded requested documents. Please verify.",
      "Can we schedule a quick call this week?",
      "Payment completed, sharing receipt here.",
      "Please confirm if biometrics slot is available.",
      "Thanks for the update, proceeding with next step.",
    ];

    messages.push({
      visaApplicationId: app._id,
      senderId: sender._id,
      senderType: sender.role === RoleEnum.ADMIN ? senderTypeEnum.ADMIN : senderTypeEnum.USER,
      messageType: messageTypeEnum.TextMsg,
      textMsg: pick(textSamples),
      fileUrl: null,
      fileName: null,
      createdAt: randomDateWithinDays(45),
      updatedAt: randomDateWithinDays(30),
    });
  }

  await MessageModel.insertMany(messages);
};

const seedTasks = async () => {
  const existing = await TaskModel.countDocuments();
  const toCreate = Math.max(0, TARGETS.tasks - existing);
  if (toCreate === 0) {
    return;
  }

  const leads = await LeadModel.find().limit(60).lean();
  const apps = await VisaApplicationModel.find().limit(60).lean();
  const users = await UserModel.find({ role: RoleEnum.ADMIN }).limit(10).lean();

  const taskNames = [
    "Verify KYC Documents",
    "Follow-up on Payment",
    "Prepare Visa Step Summary",
    "Schedule Legal Review",
    "Collect Missing Applicant Docs",
    "Update Case Timeline",
  ];

  const rows = [] as any[];
  for (let i = 0; i < toCreate; i += 1) {
    const startDate = randomDateWithinDays(30);
    const endDate = new Date(startDate.getTime() + randomInt(1, 9) * 24 * 60 * 60 * 1000);

    rows.push({
      taskName: pick(taskNames),
      description: "Auto-generated demo task to keep board activity realistic.",
      priority: pick([taskPriorityEnum.HIGH, taskPriorityEnum.MEDIUM, taskPriorityEnum.LOW]),
      startDate,
      endDate,
      attachedLead: leads.length > 0 ? pick(leads)._id : null,
      attachedConsultation: null,
      attachedVisaApplication: apps.length > 0 ? pick(apps)._id : null,
      attachedClient: users.length > 0 ? pick(users)._id : null,
      status: pick([taskStatusEnum.DUE, taskStatusEnum.COMPLETED, taskStatusEnum.OVERDUE]),
      files: [],
      remarks:
        users.length > 0
          ? [
              {
                remarkMsg: "Initial follow-up done.",
                doneBy: pick(users)._id,
              },
            ]
          : [],
    });
  }

  await TaskModel.insertMany(rows);
};

const seedLogs = async () => {
  const existing = await LogModel.countDocuments();
  const toCreate = Math.max(0, TARGETS.logs - existing);
  if (toCreate === 0) {
    return;
  }

  const leads = await LeadModel.find().limit(60).lean();
  const apps = await VisaApplicationModel.find().limit(60).lean();
  const tasks = await TaskModel.find().limit(60).lean();

  const activityTexts = [
    "Lead profile reviewed by operations.",
    "Case moved to next document stage.",
    "Applicant requested timeline clarification.",
    "Payment status refreshed from gateway.",
    "Internal note added by manager.",
  ];

  const logs = [] as any[];
  for (let i = 0; i < toCreate; i += 1) {
    logs.push({
      logMsg: pick(activityTexts),
      doneBy: pick(["Demo Admin", "Case Manager", "Automation Bot"]),
      logType: pick([
        logTypeEnum.ActivityLogs,
        logTypeEnum.LeadLogs,
        logTypeEnum.VisaApplicationLogs,
        logTypeEnum.TaskLogs,
      ]),
      leadId: leads.length > 0 ? pick(leads)._id : null,
      visaApplicationId: apps.length > 0 ? pick(apps)._id : null,
      taskId: tasks.length > 0 ? pick(tasks)._id : null,
      createdAt: randomDateWithinDays(120),
      updatedAt: randomDateWithinDays(40),
    });
  }

  await LogModel.insertMany(logs);
};

const seedRecentUpdates = async () => {
  const existing = await RecentUpdatesModel.countDocuments();
  const toCreate = Math.max(0, TARGETS.recentUpdates - existing);
  if (toCreate === 0) {
    return;
  }

  const apps = await VisaApplicationModel.find().limit(80).lean();
  if (apps.length === 0) {
    return;
  }

  const statuses = [
    "Documents Verified",
    "Awaiting Payment Confirmation",
    "Interview Slot Confirmed",
    "Application Under Review",
    "Submitted to Immigration",
  ];

  const docs = [] as any[];
  for (let i = 0; i < toCreate; i += 1) {
    const app = pick(apps);
    docs.push({
      caseId: app._id,
      name: `Case ${app.nanoVisaApplicationId || String(app._id).slice(-6)}`,
      status: pick(statuses),
      createdAt: randomDateWithinDays(80),
      updatedAt: randomDateWithinDays(20),
    });
  }

  await RecentUpdatesModel.insertMany(docs);
};

const seedDashboardStats = async () => {
  const now = new Date();

  for (let i = TARGETS.monthsOfStats - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const leadCount = randomInt(18, 42);
    const conversionCount = randomInt(6, 18);

    await MonthlyLeadStats.findOneAndUpdate(
      {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
      },
      {
        $set: {
          leadCount,
          conversionCount,
          conversionRate: Number(((conversionCount / leadCount) * 100).toFixed(1)),
          pendingApplications: randomInt(4, 15),
          completedApplications: randomInt(3, 12),
        },
      },
      { upsert: true, new: true }
    );
  }

  const revenueByType = {
    [VisaTypeEnum.DUBAI]: randomInt(95000, 150000),
    [VisaTypeEnum.PORTUGAL]: randomInt(65000, 120000),
    [VisaTypeEnum.DOMINICA]: randomInt(70000, 110000),
    [VisaTypeEnum.GRENADA]: randomInt(60000, 105000),
  };

  const entries = Object.entries(revenueByType) as [VisaTypeEnum, number][];
  for (const [visaType, totalRevenue] of entries) {
    await RevenueModel.findOneAndUpdate(
      { visaType },
      { $set: { visaType, totalRevenue } },
      { upsert: true, new: true }
    );
  }
};

const seedDemoData = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    const { superAdminRole, customerRole } = await ensureRoles();
    const users = await ensureUsers(
      superAdminRole._id as mongoose.Types.ObjectId,
      customerRole._id as mongoose.Types.ObjectId
    );

    const visaTypes = await ensureVisaTypes();
    await ensureVisaStepsAndRequirements(visaTypes);

    await seedLeads();
    const allLeads = await LeadModel.find().limit(300).lean();

    await seedConsultations(allLeads);
    await seedPayments(allLeads);
    await seedVisaApplications(users, visaTypes);
    await seedVisaStatuses();
    await seedMessages();
    await seedTasks();
    await seedLogs();
    await seedRecentUpdates();
    await seedDashboardStats();

    const summary = {
      users: await UserModel.countDocuments(),
      leads: await LeadModel.countDocuments(),
      consultations: await ConsultationModel.countDocuments(),
      payments: await PaymentModel.countDocuments(),
      visaApplications: await VisaApplicationModel.countDocuments(),
      stepStatuses: await VisaApplicationStepStatusModel.countDocuments(),
      reqStatuses: await VisaApplicationReqStatusModel.countDocuments(),
      messages: await MessageModel.countDocuments(),
      tasks: await TaskModel.countDocuments(),
      logs: await LogModel.countDocuments(),
      recentUpdates: await RecentUpdatesModel.countDocuments(),
      monthlyLeadStats: await MonthlyLeadStats.countDocuments(),
      revenueRows: await RevenueModel.countDocuments(),
    };

    console.log("\n✅ Demo data seed completed");
    console.table(summary);

    console.log("\n🔐 Demo login users (password: Demo@123)");
    console.log("- demo.admin@visaflow.com");
    console.log("- case.manager@visaflow.com");
    console.log("- priya.khanna@visaflow-demo.com");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Demo seed failed:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDemoData();

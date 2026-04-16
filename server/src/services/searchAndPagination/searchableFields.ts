export const searchableFields: Record<string, string[]> = {
  visaApplications: ["userId.name", "userId.email", "userId.phone"],
  consultations: ["leadId.fullName", "leadId.email", "leadId.phone"],
  leads: ["fullName", "email", "phone"],
  tasks: [
    "taskName",
    "assignedBy.name",
    "assignedBy.email",
    "assignedTo.name",
    "assignedTo.email",
  ],
  // assignments: ["taskDetails.taskName", "assignedByDetails.name", "assignedByDetails.email"],
  assignments: [
    "taskDetails.taskName",
    "taskName",
    "assignedBy.name",
    "assignedBy.email",
    "assignedTo.name",
    "assignedTo.email",
  ],
  users: [
    "name",
    "email",
    "phone",
    "employeeId",
    "roleInfo.name",
  ],
  payments:[
    "name",
    "email",
    "amount",
    "currency",
    "status",
    "invoiceUrl",
    "createdAt"
  ]
};

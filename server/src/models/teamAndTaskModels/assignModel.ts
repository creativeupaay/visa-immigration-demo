import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAssign extends Document {
  memberId: Types.ObjectId;
  taskId: Types.ObjectId;
  assignedBy : Types.ObjectId | null;
}

const AssignSchema = new Schema<IAssign>({
    memberId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    assignedBy : { type: Schema.Types.ObjectId, ref: "User", default: null },

});

export const AssignmentModel = mongoose.model<IAssign>("Assignments", AssignSchema);




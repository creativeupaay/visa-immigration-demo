import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
    name: string;
    visaApplicationId: mongoose.Schema.Types.ObjectId;
}

const CategorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: true,
            trim: true , 
            unique : true
        },
        visaApplicationId: {
            type: Schema.Types.ObjectId,
            ref: "VisaApplication",
            required: true
        }
    },
    { timestamps: true }
);

export const CategoryModel = mongoose.model<ICategory>("Category", CategorySchema);

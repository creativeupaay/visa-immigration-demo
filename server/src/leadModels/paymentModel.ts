import mongoose, { Document, Schema } from 'mongoose';
import {LeadModel } from "./leadModel";
import { paymentStatus , PaymentSourceEnum} from "../types/enums/enums";
import { LeadDomiGrenaModel } from './domiGrenaModel';

export interface IPayment extends Document {
  leadId: mongoose.Types.ObjectId | null;

  name: string;
  email: string;
  amount: number | null;
  currency: string | null;
  paymentMethod: string;

  status: paymentStatus;

  paymentLink: string | null;
  invoiceUrl: string | null;
  paymentIntentId: string | null;
  // sessionId : string | null ;
  source : PaymentSourceEnum ;


}

const PaymentSchema = new Schema<IPayment>(
  {
    leadId: {
        type: Schema.Types.ObjectId,
        ref: LeadModel.modelName,
        default: null
      },

    name: { type: String, required: true },
    email: { type: String, required: true },
    amount: { type: Number, default : null },
    currency: { type: String ,
      enum: ['inr', 'usd', 'eur'],
      default : null
    },
      
    paymentMethod: { type: String },

    status: {
        type: String,
        enum: Object.values(paymentStatus),
        required : true
      },

    paymentLink: { type: String },
    invoiceUrl: { type: String  , default : null},
    paymentIntentId: { type: String , default : null},
    // sessionId : {type : String , default : null} ,
    source : {
      type:String , 
      required :true ,
      enum : Object.values(PaymentSourceEnum) 
    }
  },
  {timestamps: true}
);

export const PaymentModel = mongoose.model<IPayment>('Payment', PaymentSchema);


// 1st stage 
// leadId
// name 
// email
// status
// payment_link

// 2nd stage 
// match by leadId
// paymentIntentId
// sessionId
// amount
// currency 


// status  -->> PAID OR FAILED
// INVOICE_URL , payment_method  :
                  //  success -->> fetch and set 
                  //  fail    -->> set null or don't set (automatically set null)





                  



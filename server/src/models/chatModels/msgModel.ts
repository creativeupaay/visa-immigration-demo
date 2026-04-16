import mongoose, { Schema, Document, Types } from "mongoose";
import { messageTypeEnum , senderTypeEnum } from "../../types/enums/enums";


export interface IMessage extends Document {
  visaApplicationId: Types.ObjectId;
  senderId : Types.ObjectId ;

  senderType: senderTypeEnum;
  messageType : messageTypeEnum;

  textMsg: string | null;
  fileUrl : string | null;
  fileName : string | null ;

  createdAt : string ; 
  updatedAt : string ; 
}

const MessageSchema = new Schema<IMessage>(
  {
    visaApplicationId: { 
      type: Schema.Types.ObjectId, 
      ref: "VisaApplication" , 
      required: true 
    },
    senderId : {
      type :Schema.Types.ObjectId ,
      ref: "User" , 
      required: true 
    },
    senderType: { 
      type: String, 
      enum: Object.values(senderTypeEnum), 
      required: true 
    },
    messageType: { 
      type: String, 
      enum: Object.values(messageTypeEnum), 
      required:true
    },
    textMsg: { 
      type: String, 
      default: null 
    },
    fileUrl: { 
      type: String,
      default : null
    },
    fileName: { 
      type: String,
      default : null
    },

  },
  {
    timestamps: true, 

  }
);

export const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);



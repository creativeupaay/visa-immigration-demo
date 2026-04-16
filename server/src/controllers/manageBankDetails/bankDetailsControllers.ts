import { Request, Response } from "express";
import { DgBankDetailsModel } from "../../extraModels/dgBankDetails";


export const getBankDetails = async(req: Request, res: Response)=>{
    try {
        const { visaTypeName } = req.query;
    
        if (!visaTypeName) {
            return res.status(400).json({ error: 'visaType Name not found' });
        }

        const bankDetails = await DgBankDetailsModel.findOne({ visaTypeName: visaTypeName });
    
        if (!bankDetails) {
          return res.status(404).json({ message: "Bank details not found for given visa type" });
        }
    
        return res.status(200).json(bankDetails);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
      }
}

export const editBankDetails = async(req: Request, res: Response)=>{

    try {
        const { visaTypeName } = req.params;
        const updateData = req.body;


        console.log(visaTypeName,req.body)

        if (!visaTypeName || !updateData) {
            return res.status(400).json({ error: 'visaType Name not found' });
        }

    
        const updated = await DgBankDetailsModel.findOneAndUpdate(
          { visaTypeName: visaTypeName },
          updateData,
          { new: true, runValidators: true }
        );
    
        if (!updated) {
          return res.status(404).json({ message: 'Bank details not found' });
        }
    
        return res.status(200).json(updated);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
      }
}
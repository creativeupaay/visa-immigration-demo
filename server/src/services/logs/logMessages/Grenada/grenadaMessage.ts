



export const getGrenadaMessage =(clientName:string , visaType : string ,stepName : string ,adminName : string ,investmentOption : string = "", messageId:string)=>{
    let message = '';
    switch (messageId) {
        case 'grenada-user-documents-submitted':
            message = `[${visaType}-${clientName}] ${stepName} : Documents Uploaded by client`;
            break;
        case 'grenada-user-documents-approved':
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) approved the client documents`;
            break;
        case 'grenada-user-due-diligence':
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) approved Due Diligence for the client`;
            break;
        case 'grenada-user-investment-option-selected':
            message = `[${visaType}-${clientName}] ${stepName} : Client selected ${investmentOption} as investment option `;
            break;
        case 'grenada-admin-added-options-for-realState':
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) added options for the client to invest in real estate.`;
            break;
        case 'grenada-user-upload-invoice':
            message = `[${visaType}-${clientName}] ${stepName} : Client uploaded invoice of the investment.`;
            break;


        case 'grenada-user-government-approval':
            message = `[${visaType}-${clientName}] ${stepName} : client's application got approved by the government.`;
            break;


        case 'grenada-admin-passport-uploaded':
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) uploaded client's passport`;
            break;


        case 'grenada-user-delivery-details-submitted':
            message = `[${visaType}-${clientName}] ${stepName} : Client added Delivery Address for the delivery of his/her passport `;
            break;
        case 'grenada-admin-shipping-details-submitted':
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) added Shipping Details for the delivery of client's passport `;
            break;


        case 'grenada-admin-documents-submitted':
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) uploaded documents`;
            break;
        default:
            message = `[${visaType}-${clientName}] ${stepName} : Application Status Update`;
    }
    return message;
}


// step 1 : upload documents  (By Client)
// step 2 : Due diligence -->> only on approval (A single log)
// step 3 : Investment  :   [ Real state or EDF ]
// EDF -->> Direct payment invoice
// Real state -->> addOptions (By Admin) -->> payment invoice (By client)
                // selectOption
                // addOptionsForRealState
                // uploadInvoice

//  ****Note*** -->> bank details directly Admin panel se ayegi
// step 4 :   only approve from admin-side (only one action ) -->> Approval 
// step 5 :   Upload passport (admin side )
// step 6 :   passport delivery
            //  1.  Upload delivery Details
            //  2.  Upload Shipping Details
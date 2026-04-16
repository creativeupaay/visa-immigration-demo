

export const getDubaiMessage=(clientName:string , visaType : string ,stepName : string ,adminName : string , messageId:string)=>{
    let message = '';
    switch (messageId) {
        case 'dubai-user-documents-submitted': 
            message = `[${visaType}-${clientName}] ${stepName} : Documents Uploaded by client `;
            break;
        case 'dubai-user-documents-approved':  
            message = `[${visaType}-${clientName}] ${stepName} : Client Documents Approved by Admin (${adminName}) `;
            break;
        case 'dubai-user-tradeNameOptions-sent':
            message = `[${visaType}-${clientName}] ${stepName} : Client sent a trade name request along with multiple trade name options`
            break;
        case 'dubai-admin-tradename-assigned':  
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) assigned a trade-name to client`;
            break;
        case 'dubai-user-tradename-req-for-change':  
            message = `[${visaType}-${clientName}] ${stepName} : Client made a request for a trade name change`;
            break;
        case 'dubai-admin-approved-change-req': 
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) approved the trade name change request made by the client`;
            break;
        case 'dubai-admin-rejected-change-req':  
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) rejected the trade name change request made by the client`;
            break;
        case 'dubai-user-initial-approval': 
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) Granted Initial Approval to the client , now waiting for payment`;
            break;
        case 'dubai-admin-payment-submitted': 
            message = `[${visaType}-${clientName}] ${stepName} : Payment Received from client `;
            break; 


        case 'dubai-admin-moa-uploaded':  
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) uploaded MOA document , now client has to review & sign`;
            break;
        case 'dubai-user-signature-submitted':
            message = `[${visaType}-${clientName}] ${stepName} : MOA Signed by the client `;
            break;
        case 'dubai-admin-signature-approved':
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName})  approved MOA document uploaded by client `;
            break;



        case 'dubai-user-business-license-approved':
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) issued Dubai Business License for the cient`;
            break;
        case 'dubai-admin-establishment-card-approved':
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) issued Dubai Business Establishment card for the cient`;
            break;


        case 'dubai-user-medical-test-submitted':
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) updated medical test details for the client`;
            break;
        case 'dubai-admin-marked-as-completed':
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) marked that medical test as completed`;
            break;
        case 'dubai-user-sent-reScheduling-req':
            message = `[${visaType}-${clientName}] ${stepName} : client sent request to reSchedule his medical test`;
            break;
        case 'dubai-admin-approved-reScheduling-req':
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) approved the client's request to reschedule the medical test.`;
            break;
        case 'dubai-admin-rejected-reScheduling-req':
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) rejected the client's request to reschedule the medical test.`;
            break;

    

        case 'dubai-admin-emirates-visa-approved':
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) Approved Visa & Emirates ID  for the client `;
            break;
        case 'dubai-admin-bank-approved':
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) opened bank account for client`;
            break;


        case 'dubai-admin-documents-approved':
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) Uploaded Business Setup Documents `;
            break;

        default:
            message = `[${visaType}-${clientName}] ${stepName} : Your Application Status Update`;
    }
    return message;
}










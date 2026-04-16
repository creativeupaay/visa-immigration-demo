

export const getPortugalMessage=(clientName:string , visaType : string ,stepName : string ,adminName : string ,investmentOption : string = "", messageId:string)=>{
    let message= '';
    switch (messageId) {
        case 'portugal-user-documents-submitted': 
            message = `[${visaType}-${clientName}] ${stepName} : Documents Uploaded by client`;
            break;
        case 'portugal-user-documents-approved': 
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) approved the client documents`;
            break;
        case 'portugal-admin-documents-submitted': 
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) uploaded documents `;
            break;


        case 'portugal-user-nif-submitted': 
            message = `[${visaType}-${clientName}] ${stepName} : Client Requested for NIF document`;  
            break;
        case 'portugal-admin-nif-uploaded': 
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) uploaded NIF document`;
            break;



        case 'portugal-bank-opened': 
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) opened Portugal bank account for Client`;
            break;


        case 'portugal-aima-scheduled': 
            message = `[${visaType}-${clientName}] ${stepName} : Admin (${adminName}) scheduled a AIMA appointment for the client `;
            break;

            
        case 'portugal-visa-approved': 
            message = `[${visaType}-${clientName}] ${stepName} : Portugal VISA is approved for the client `;
            break;
        default:
            message = `${name}, Application Status Update`;
    }
    return message;
}

// Time
// step number 
// Done By (AdminName)
// Name_visaType
// No need of clientName (we will use only client word)

// Also add status in visaSteps of triggers 
// Also add status of logTriggers in the visaSteps 







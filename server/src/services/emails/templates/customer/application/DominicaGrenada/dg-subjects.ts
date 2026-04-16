

export const getDgUserSubject=(name:string,templateId:string)=>{
    let subject = '';
    switch (templateId) {
        case 'dg-user-delivery-approved':
            subject = `${name}, Your Passport is being delivered.`;
            break;
        case 'dg-user-documents-approved':
            subject = `Your Documents are Verified`;
            break;
        case 'dg-user-documents-submitted':
            subject = `We’ve Received Your Documents – Review in Progress`;
            break;
        case 'dg-user-due-diligence':
            subject = `Your Due Diligence is Approved!`;
            break;
        case 'dg-user-government-approval':
            subject = `Congratulations! Your Application Is Approved`;
            break;
        case 'dg-user-investment-confirmed':
            subject = `Your Investment is Confirmed – Final Government Processing Started`;
            break;
        case 'dg-user-passport-approved':
            subject = `${name}, Here is Your Passport!`;
            break;
        default:
            subject = `${name}, Your Application Status Update`;
    }
    return subject;
}
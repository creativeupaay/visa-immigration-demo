

export const getDubaiUserSubject=(name:string,templateId:string)=>{
    let subject = '';
    switch (templateId) {
        case 'dubai-user-documents-submitted':
            subject = `We’ve Received Your Documents – Review in Progress`;
            break;
        case 'dubai-user-documents-approved':
            subject = `Documents Verified – Trade Name Reservation in Progress`;
            break;
        case 'dubai-user-tradename-approved':
            subject = `Your Trade Name is Approved – Please Confirm`;
            break;
        case 'dubai-user-initial-approval':
            subject = `Initial Approval Granted – Complete Payment to Proceed`;
            break;
        case 'dubai-user-moa-submitted':
            subject = `Your MOA is Ready – Please Review & Sign`;
            break;
        case 'dubai-user-business-license-approved':
            subject = `Your Dubai Business License is Issued!`;
            break;
        case 'dubai-user-establishment-card-approved':
            subject = `Your Establishment Card is Ready – Confirm to Proceed`;
            break;
        case '"dubai-user-medical-test-submitted':
            subject = `Medical Test Scheduled – Check Your Appointment Details`;
            break;
        case 'dubai-user-emirates-visa-approved':
            subject = `You're Now a UAE Resident – Emirates ID Issued`;
            break;
        case '"dubai-user-bank-approved':
            subject = `Your UAE Business Bank Account is Now Open`;
            break;
        default:
            subject = `${name}, Your Application Status Update`;
    }
    return subject;
}
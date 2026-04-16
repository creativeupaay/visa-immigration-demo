

export const getDubaiAdminSubject=(name:string,templateId:string)=>{
    let subject = '';
    switch (templateId) {
        case 'dubai-admin-documents-approved':
            subject = `${name} Uploaded Business Setup Documents – Begin Verification`;
            break;
        case 'dubai-admin-tradename-submitted':
            subject = `${name} Trade Name Approved`;
            break;
        case 'dubai-admin-payment-submitted':
            subject = `Payment Received from ${name} – Proceed to MOA Preparation`;
            break;
        case 'dubai-admin-signature-submitted':
            subject = `MOA Signed by ${name} – Finalize License Issuance`;
            break;
        case 'dubai-admin-establishment-card-approved':
            subject = `Establishment Card Issued for ${name}`;
            break;
        case 'dubai-admin-emirates-visa-approved':
            subject = `Visa & Emirates ID Approved for ${name}`;
            break;
        case 'dubai-admin-bank-approved':
            subject = `Dubai Bank Account Opened for ${name}`;
            break;
        default:
            subject = `${name}, Your Application Status Update`;
    }
    return subject;
}
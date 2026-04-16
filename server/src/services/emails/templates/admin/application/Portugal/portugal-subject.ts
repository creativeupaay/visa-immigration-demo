

export const getPortugalAdminSubject=(name:string,templateId:string)=>{
    let subject = '';
    switch (templateId) {
        case 'portugal-admin-documents-submitted':
            subject = `${name} Uploaded D7 Documents – Begin Verification`;
            break;
        case 'portugal-admin-nif-submitted':
            subject = `${name} Uploaded NIF Document.`;
            break;
        default:
            subject = `${name}, Application Status Update`;
    }
    return subject;
}
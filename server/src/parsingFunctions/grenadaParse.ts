type GrenadaRawData = {
    q1_fullName?: { first?: string; last?: string };
    q4_nationality?: string;
    dropdown_search?: string;
    q6_email?: string;
    q62_fullPhone?: string;

    q42_whichBest42?: string;

    q53_whatsYour53?: string;
    q52_whatBudget?: string;
    q54_areYou54?: string;
    q55_haveYou55?: string;
    q38_anythingElse?: string;

    q43_doYou43 : string;
    q44_whatsYour44 : string; // Business owner
    q45_areYou : string;

    q50_areYou50 : string;
    q58_whichInvestment : string; //investor

    q56_whatIs: string;  // HNMI
    q47_areYou47 : string;

    q60_whatIs60 : string;  // Employee
    q61_doYou : string;

    q59_pleaseSpecify : string;  //other

    slug?: string;
    event_id?: string;
    // timeToSubmit?: number;
};



// Final structured parsed data
export type ParsedGrenadaXXXData = {
    formId: string;
    visaTypeName : string ,

    fullName: string;
    nationality: string;
    email: string;
    phone: string;
    profession: string;

    // isme null isliye doya kyuki ye bhi optional field hai (jab profession == other choose hoga , tab hi ayegi )

    businessOwner: {
        registeredBusiness: string | null;
        annualRevenue: string | null;
        investmentPreference: string | null;
    };

    investor: {
        readyToInvest: string | null;
        investmentRoute: string | null;
    };

    HNWI: {
        totalAssets: string | null;
        citizenshipReason: string | null;
    };

    employee: {
        monthlyIncome: string | null;
        isInvestmentCapitalReady: string | null;
    };

    other : {
        otherProfessionDetail: string | null;
    };

    mainGoal: string;
    budgetRange: string;
    movingToApply: string;
    visaIssues: string;
    extraInfo: string;

    event_id: string;
    // timeToSubmit: number;
    
};







export const parseGrenadaData = (rawData: GrenadaRawData): ParsedGrenadaXXXData => {
    const profession = rawData?.q42_whichBest42 || "";

    const parsedData: ParsedGrenadaXXXData = {

        formId: rawData?.slug?.split("/")?.[1] || "",
        visaTypeName : "GRENADA",

        fullName: `${rawData?.q1_fullName?.first || ""} ${rawData?.q1_fullName?.last || ""}`,
        nationality: rawData?.q4_nationality || rawData?.dropdown_search || "",
        email: rawData?.q6_email || "",
        phone: rawData?.q62_fullPhone || "",
        profession,
        mainGoal: rawData?.q53_whatsYour53 || "",
        budgetRange: rawData?.q52_whatBudget || "",
        movingToApply: rawData?.q54_areYou54 || "",
        visaIssues: rawData?.q55_haveYou55 || "",
        extraInfo: rawData?.q38_anythingElse || "",
        event_id: rawData?.event_id || "",
        // timeToSubmit: rawData?.timeToSubmit || 0,
        

        // Optional fields set to null initially

        businessOwner: {
            registeredBusiness: null,
            annualRevenue: null,
            investmentPreference: null
        },

        investor: {
            readyToInvest: null,
            investmentRoute: null
        },

        HNWI: {
            totalAssets: null,
            citizenshipReason: null
        },

        employee: {
            monthlyIncome: null,
            isInvestmentCapitalReady: null
        } , 

        other : {
            otherProfessionDetail: null,
        },
    };

    // Populate respective field based on profession
    switch (profession) {
        case "Business Owner / Entrepreneur":
            parsedData.businessOwner = {
                registeredBusiness: rawData?.q43_doYou43 || null,
                annualRevenue: rawData?.q44_whatsYour44 || null,
                investmentPreference: rawData?.q45_areYou || null
            };
            break;

        case "Investor":
            parsedData.investor = {
                readyToInvest: rawData?.q50_areYou50 || null,
                investmentRoute: rawData?.q58_whichInvestment || null
            };
            break;

        case "High-Net-Worth Individual (HNWI)":
            parsedData.HNWI = {
                totalAssets: rawData?.q56_whatIs || null,
                citizenshipReason: rawData?.q47_areYou47 || null
            };
            break;

        case "Employee / Professional":
            parsedData.employee = {
                monthlyIncome: rawData?.q60_whatIs60 || null,
                isInvestmentCapitalReady: rawData?.q61_doYou || null
            };
            break;  

        case "Other":
            parsedData.other = {
                otherProfessionDetail : rawData?.q59_pleaseSpecify || null,
            };
            break;
    }

    return parsedData;
};


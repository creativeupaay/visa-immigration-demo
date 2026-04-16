

const JOTFORM_ID_PORTUGAL=process.env.JOTFORM_ID_PORTUGAL ?? ""
const JOTFORM_ID_DOMINICA_GRENADA=process.env.JOTFORM_ID_DOMINICA_GRENADA ?? ""
const JOTFORM_ID_DUBAI=process.env.JOTFORM_ID_DUBAI ?? ""

if (!JOTFORM_ID_PORTUGAL || !JOTFORM_ID_DOMINICA_GRENADA || !JOTFORM_ID_DUBAI) {
  throw new Error("One or more JotForm IDs are not defined in the environment variables.");
}

export {JOTFORM_ID_DOMINICA_GRENADA, JOTFORM_ID_PORTUGAL, JOTFORM_ID_DUBAI};





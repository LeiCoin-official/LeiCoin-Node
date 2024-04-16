
export const VerificationCodes: {[key: number]: string} =  {

    // 12000 - 12099: Success Codes
    12000: "OK",

    // 12100 - 12199: Informational Codes

    // 12300 - 12399: Server Error Codes
    12300: "Unknown Server Error",
    12301: "Service Unavailable",
    12302: "Internal Timeout",

    // 12400 - 12499: Client Error Codes

    // 12400 - 12499: General Client Erros
    12400: "Unknown Client Error",
    12401: "Connection refused",
    12402: "Endpoint not found",
    12403: "Data Payload Too Large",
    12404: "Too Many Requests",

    // 12500 - 12599: Data Invalidation Errors. Prefix: "Data Error: {message}"
    // General
    12500: "Unknown Data Error",
    12501: "Could not be parsed. Maybe Incomplete Data",
    12502: "Invalid Type",
    12503: "Invalid Version",
    12504: "Invalid Hash",
    12505: "Invalid Public Key",
    12506: "Invalid Signature",
    12507: "Invalid Address",
    12508: "Invalid Nonce",
    12509: "Invalid Timestamp",
    12510: "Invalid Amount",
    
    // Transaction Only
    12520: "Invalid Transaction",
    12521: "Invalid Sender Address",
    12522: "Invalid Recipient Address",
    12523: "Sender Address does not correspond to the Sender Public Key",
    12524: "Sender has not enough Money",

    // Block Only
    12530: "Invalid Block",
    12531: "Invalid Previous Hash",

    // Proposition Only
    12540: "Invalid Proposition",
    12541: "Invalid Proposer for Slot",

    // Attestation Only
    12550: "Invalid Attestation",
    12551: "Invalid Attester for Slot",
    
};
export const RESPONSE_ERROR: Record<string, string> = {
  "1010": "EMV Initialition Error",
  "1001": "Service is busy (operation in progress)",
  "1000": "initialization succesfull",
  "1": "INCORRECT_MSGID",
  "2": "MSG_FORMAT_ERROR",
  "3": "MSG_PARSING_ERROR",
  "4": "MSG_PARAMS_ERROR",
  "5": "UNKNOWN_TRANS_TYPE",
  "6": "ISO_APPLICATION_ERROR",
  "7": "EMV_APPLICATION_ERROR",
  "12": "OPERATION_FINISHED",
  "13": "PINPAD_INIT_ERROR",
  "14": "PINPAD_FAILURE",
  "15": "INVALID_CARD",
  "16": "OPERATION_CANCELLED",
  "17": "OPERATION_TIMEOUT",
  "18": "DECLINED_GAC2",
  "19": "CARD_REMOVED",
  "21": "DEVICE_FAILURE",
  "23": "EMCRYPTION_FAILURE",
  "24": "GENERIC_ERROR",
  "25": "NETWORT_NOT_AVAILABLE",
  "26": "OPERATION_VOIDED",
  "0": "Success",
  "100": "Offline processing in terminal",
  "101": "Declined: Expired card",
  "105": "Declined",
  "106": "Declined: PIN limit exceeded",
  "117": "Declined: Incorrect PIN",
  "126": "Declined: Invalid PIN block",
  "127": "Declined: Invalid ciphered card data",
  "129": "Declined: Incorrect CVV2/CVC2",
  "180": "Declined: Card Not Supported",
  "184": "Declined: Cardholder Authentication Error",
  "190": "Issuer Denied Operation",
  "191": "Expiration Date Error",
  "195": "PSD2: Mandatory Insert Chip",
  "196": "PSD2: Repeat with PIN",
  "201": "Not processed",
  "202": "Card Under fraud risk suspicion",
  "400": "Operation voided",
  "600": "Totals",
  "602": "Details not available",
  "603": "Receipt not found",
  "700": "Entry Point Not Available",
  "749": "Entry Point Not Available",
  "900": "Authorised for Refund and Confirmations",
  "904": "MerchantID not found",
  "909": "System Error",
  "912": "Issuer not available",
  "913": "Duplicated OrderID",
  "916": "Invalid MAC",
  "944": "Invalid Session",
  "948": "Invalid local terminal date & time",
  "950": "Refund Operation not allowed",
  "9064": "Invalid Card Data",
  "9078": "Operation Not Allowed for this card",
  "9093": "Unexisting Card",
  "9094": "Foreign Servers Rejection",
  "9104": "Merchant without Secure Key Information",
  "9218": "Secure operations not allowed for this MerchantID",
  "9253": "Luhn Check Digit Error",
  "9256": "Preauthorizations not allowed for this MerchantID",
  "9257": "Preauthorizations not allowed for this card",
  "9261": "Operation Denied Restrictions Control Overcome",
  "9915": "User Cancelled Operation",
  "9997": "There is a transaction in course in SIS with the same card",
  "9998": "Transaction card data request in course",
  "9999": "Transaction redirected to the Issuer for Authention",
  "9912": "Issuer Not Available",
  "10000": "Tiempo de espera superado",
  "10001": "Error en la conexión",
};

export const STATUS = {
  PENDING: "pending",
  APPROVED: "ACEPTADA",
  DECLINED: "declined",
  ERROR: "error",
} as const;

export const TRANSACTION_RESPONSE_STATUS_OK = 0; 

// New constants
export const HEADER_X_SOURCE = 'X-SOURCE';
export const SOURCE_COMERCIA = 'COMERCIA';
export const DEVICE_TYPE_WIFI = 'WIFI';
export const DEVICE_TYPE_CABLE = 'CABLE';
export const CURRENCY_EUR = 'EUR';

export const RESULT_CODES = {
  SUCCESS: 0,
  EMV_INITIALIZATION_ERROR: 1010,
  SERVICE_BUSY: 1001,
  INITIALIZATION_SUCCESSFUL: 1000,
  MSG_FORMAT_ERROR: 2,
  TRANSACTION_NOT_FOUND: 602,
  INVALID_PARAMS_ERROR: 4, // Corresponds to "MSG_PARAMS_ERROR" in RESPONSE_ERROR
  REFUND_OPERATION_NOT_ALLOWED: 950, // Corresponds to "Refund Operation not allowed" in RESPONSE_ERROR
  // ... other result codes can be mapped here if needed
} as const;
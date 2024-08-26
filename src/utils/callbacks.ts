//export type CB = "SUCCESS" | "NONE" | "ERROR";

export enum CB {
    SUCCESS,
    NONE,
    ERROR
}

export const statusCodes: {[key: number]: string} = {
    200: "OK",
    400: "Bad Request",
    404: "Not Found",
    500: "Internal Server Error"
}

export function getAPICallbackMessage(status: number, message: string) {

    return (statusCodes[status] ? `${statusCodes[status]}. ` : "") + message;

}
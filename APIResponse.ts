export interface APIResponse {
    data?: any;
    isValid: boolean;
    message?: string;
    error?: {
        errorCode?: number,
        statusCode?:number,
        message?:string
    }
}

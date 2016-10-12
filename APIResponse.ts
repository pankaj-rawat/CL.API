export interface APIResponse {
    data?: any;
    isValid: boolean;
    message?: string;
    error?: {
        number: number,
        message?:string
    }
    error1?: any;
}

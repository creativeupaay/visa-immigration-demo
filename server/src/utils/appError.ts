export default class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;
    details?: any;

    constructor(message: string, statusCode: number, details?: any | null) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        if (details !== null && details !== undefined) {
            this.details = details;
        }

        Error.captureStackTrace(this, this.constructor);
    }
}


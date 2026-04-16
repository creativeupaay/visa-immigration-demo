import { StatusCodes } from "http-status-codes";
import AppError from "../utils/appError";
import { Request, Response, NextFunction } from "express";

const devErrors = (res: Response, error: any) => {
    res.status(error.statusCode).json({
        status: error.statusCode,
        message: error.message,
        stackTrace: error.stack,
        error: error,
    });
};

const prodErrors = (res: Response, error: any) => {
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message,
        });
    } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Something went wrong! Please try again later.",
        });
    }
};

const validationErrorHandler = (err: any) => {
    const errors = Object.values(err.errors).map((val: any) => val.message);
    const errorMessages = errors.join(". ");
    const msg = `Invalid input data: ${errorMessages}`;

    return new AppError(msg, StatusCodes.BAD_REQUEST);
};

const duplicateKeyErrorHandler = (err: any) => {
    const field = Object.keys(err.keyValue).join(", ");
    const msg = `Duplicate field: ${field}. Please use another value!`;

    return new AppError(msg, StatusCodes.BAD_REQUEST);
};

const castErrorHandler = (err: any) => {
    const msg = `Invalid value for ${err.path}: ${err.value}!`;
    return new AppError(msg, StatusCodes.BAD_REQUEST);
};

const errorHandlerMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log("---errorHandlerMiddleware---");

    err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    err.status = err.status || "error";
    console.log(err);
    if (!(err instanceof AppError)) {
        err = new AppError(
            err.message || "Something went wrong, try again later",
            err.statusCode
        );
    }

    if (process.env.NODE_ENV === "development") {
        devErrors(res, err);
    } else if (process.env.NODE_ENV === "production") {
        console.log("prod error");

        if (err.name === "ValidationError") {
            err = validationErrorHandler(err);
        } else if (err.code === 11000) {
            err = duplicateKeyErrorHandler(err);
        } else if (err.name === "CastError") {
            err = castErrorHandler(err);
        }

        prodErrors(res, err);
    }
};

export default errorHandlerMiddleware;

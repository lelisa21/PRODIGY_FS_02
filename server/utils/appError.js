class AppError extends Error{
    constructor(message, statusCode){
        super(message)
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
        this.isOperational = true
        Error.captureStackTrace(this, this.constructor) 
        // capture a stack trace and exclude the constructor function from it, so that when an error is thrown, the stack trace will start from the point where the error was created, rather than including the internal workings of the AppError class itself. This helps to provide a cleaner and more relevant stack trace for debugging purposes.

        if(Error.captureStackTrace){
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export default AppError

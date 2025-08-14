const asyncErrorHandler = (func) =>{
    return (req , res , next)=>{
        func(req , res , next)
            .then(console.log('async mw is running'))
            .catch((err)=>{
                console.log('global error handler called....')
                next(err)
            })
    }
}

module.exports = asyncErrorHandler;
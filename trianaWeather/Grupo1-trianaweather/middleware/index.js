'use strict'

const passport          = require('passport');
const error_types       = require('../controllers/error_types');
const _                 = require('lodash');

function ensureAuthenticatedWithRole(role, req, res, next) {
    passport.authenticate('jwt', {session: false}, (err, user, info)=>{
        if(info){ return next(new error_types.Error401(info.message)); }
        console.log(user)
        if (err) { return next(err); }
        if (!user) { return next(new error_types.Error403("You are not allowed to access.")); }

        if (user.role=="ADMIN"){
            role="ADMIN" || "MANAGER"
        }

        if (user.role=="MANAGER"){
            role="MANAGER" || "USER"
        }

        if (user.role==role){
            req.user = user;
            next();
        }
        else{
            return next(new error_types.Error403("El usuario no posee el rol necesario."));
        }
    })(req, res, next);
}

let middlewares = {
    
    ensureAuthenticated: (req,res,next)=>{  
        ensureAuthenticatedWithRole("USER", req, res, next);
    },
    ensureAuthenticatedManager: (req,res,next) => {
        ensureAuthenticatedWithRole("MANAGER",req, res, next);
    },
    ensureAuthenticatedAdmin: (req,res,next) => {
        ensureAuthenticatedWithRole("ADMIN",req, res, next);
    },

    errorHandler: (error, req, res, next) => {
        if(error instanceof error_types.InfoError)
            res.status(200).json({error: error.message});
        else if(error instanceof error_types.Error404)
            res.status(404).json({error: error.message});
        else if(error instanceof error_types.Error403)
            res.status(403).json({error: error.message});
        else if(error instanceof error_types.Error401)
            res.status(401).json({error: error.message});
        else if(error instanceof error_types.Error400)
            res.status(400).json({error: error.message});
        else if(error.name == "ValidationError") //de mongoose
            res.status(200).json({error: error.message});
        else if(error.message)
            res.status(500).json({error: error.message});
        else
            next();
    },

    notFoundHandler: (req, res, next) => {
        res.status(404).json({error: "endpoint not found"});
    }
}
    

module.exports = middlewares;
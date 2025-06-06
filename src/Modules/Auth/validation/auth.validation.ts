import Joi from 'joi';

export const loginSchema = Joi.object({
    email: Joi.string().email().required().label('email'),
    password: Joi.string().required().label('password'),
}).unknown(true);

export const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required().label('email'),
}).unknown(true);

export const verifyOtpSchema = Joi.object({
    otp: Joi.string().length(6).required().label('otp'),
}).unknown(true);

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;

export const resetPasswordSchema = Joi.object({
    newPassword: Joi.string().pattern(passwordRegex).required().label('newPassword'),
    confirmPassword: Joi.string().pattern(passwordRegex).required().label('confirmPassword'),
}).unknown(true);


export const signupSchema = Joi.object({
    username: Joi.string().min(3),
    email: Joi.string().email(),
    password: Joi.string().min(8),
});
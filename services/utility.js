import Joi from "joi";

export class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

const schema_username = Joi.object({
    username: Joi.string()
        .min(3)
        .max(30) // at least 3 characters long but no more than 30
        .required(), // a required string

})

const schema_phonenumber = Joi.object({
    phone_number: Joi.string().pattern(/^0\d{9}$/).required().min(10).max(10)
})

const schema_email = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }) // a valid email address string, must have two domain parts e.g. example.com, TLD must be .com or .net
})
const schema_password = Joi.object({
    password: Joi.string()
        .pattern(new RegExp('^[A-Za-z0-9]+$'))
        .min(6)
        .required()
})
export let validateInput = async (req, res, next) => {
    const message = req.body.message;
    if (message == "username") {
        const input = {
            username: req.body.payload
        }
        const { error } = schema_username.validate(input);
        if (error) {
            res.send({ message: "invalid" });
        } else {
            res.send({ message: "valid" });
        }
    }
    if (message == "password") {
        const input = {
            password: req.body.payload
        }
        const { error } = schema_password.validate(input);
        if (error) {
            res.send({ message: "invalid" });
        } else {
            res.send({ message: "valid" });
        }
    }
    if (message == "phone_number") {
        const input = {
            phone_number: req.body.payload
        }
        const { error } = schema_phonenumber.validate(input);
        // console.log(error);
        if (error) {
            res.send({ message: "invalid" });
        } else {
            res.send({ message: "valid" });
        }
    }
    if (message == "email") {
        const input = {
            email: req.body.payload
        }
        const { error } = schema_email.validate(input);
        if (error) {
            res.send({ message: "invalid" });
        } else {
            res.send({ message: "valid" });
        }
    }
}

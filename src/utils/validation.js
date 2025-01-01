const validator = require("validator");

const bcrypt = require("bcrypt");

const validateSignUpData = (req) => {
    const { firstName, lastName, emailId, password } = req.body;
    
    if(!firstName || !lastName){
        throw new Error("Name is not valid!");
    }else if(!validator.isEmail(emailId)){
        throw new Error("Email is not valid!");
    }else if(!validator.isStrongPassword(password)){
        throw new Error("Password is weak !");
    }
}

const validateProfileUpdateData = (req) => {
    const allowedFieldsEdit = ["firstName", "lastName", "age", "gender", "about", "skills", "photo"];

    const isValidUpdateRequest = Object.keys(req.body).every(key => allowedFieldsEdit.includes(key));

    return isValidUpdateRequest;
}


const validateUserCurrentPassword = async(req) => {
    const user = req.user;

    const { password } = req.body;

    const isPasswordValid = await bcrypt.compare(user.password, password);

    return isPasswordValid;
}

module.exports = { validateSignUpData, validateProfileUpdateData, validateUserCurrentPassword };
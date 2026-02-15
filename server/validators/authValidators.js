import { body, validationResult } from 'express-validator';

export const validateRegister = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores'),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/\d/).withMessage('La contraseña debe contener al menos un número')
        .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula'),
];

export const validateLogin = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required'),
    body('password')
        .notEmpty().withMessage('Password is required')
];

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

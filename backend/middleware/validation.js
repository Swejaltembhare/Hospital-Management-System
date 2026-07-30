// middleware/validation.js
import { body, param, query, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  console.log("REQ BODY:", req.body);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());

    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }

  next();
};

// Patient Registration Validation
export const validatePatientRegistration = [
  body('fullName')
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Password must contain at least one letter and one number'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  body('phoneNumber')
    .matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
  body('dateOfBirth')
    .isISO8601().withMessage('Valid date of birth is required')
    .custom((value) => {
      const age = new Date().getFullYear() - new Date(value).getFullYear();
      if (age < 0 || age > 120) {
        throw new Error('Invalid age');
      }
      return true;
    }),
  body('gender')
    .isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
  handleValidationErrors
];

// Login Validation
export const validateLogin = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Create Doctor Validation (Admin)
export const validateCreateDoctor = [
  body('fullName')
    .notEmpty().withMessage('Full name is required'),
  body('email')
    .isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phoneNumber')
    .matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
  body('department')
    .notEmpty().withMessage('Department is required'),
  body('specialization')
    .notEmpty().withMessage('Specialization is required'),
  body('qualification')
    .notEmpty().withMessage('Qualification is required'),
  body('experience')
    .isInt({ min: 0, max: 50 }).withMessage('Experience must be between 0 and 50 years'),
  body('consultationFee')
    .isNumeric({ min: 0 }).withMessage('Consultation fee must be a positive number'),
  handleValidationErrors
];

// Update User Validation
export const validateUpdateUser = [
  param('id')
    .isMongoId().withMessage('Invalid user ID'),
  body('fullName')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('phoneNumber')
    .optional()
    .matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
  handleValidationErrors
];

// Password Change Validation
export const validatePasswordChange = [
  param('id')
    .isMongoId().withMessage('Invalid user ID'),
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Password must contain at least one letter and one number'),
  body('confirmNewPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New passwords do not match');
      }
      return true;
    }),
  handleValidationErrors
];


export const validateUpdateDoctor = [
  body("fullName").notEmpty().withMessage("Full name is required"),

  body("email")
    .isEmail()
    .withMessage("Valid email is required"),

  body("phoneNumber")
  .optional()
  .matches(/^[0-9]{10}$/)
  .withMessage("Phone number must be 10 digits"),

  body("department")
    .notEmpty()
    .withMessage("Department is required"),

  body("specialization")
    .notEmpty()
    .withMessage("Specialization is required"),

  body("qualification")
    .notEmpty()
    .withMessage("Qualification is required"),

  body("experience")
    .isInt({ min: 0, max: 50 }),

  body("consultationFee")
    .isNumeric(),

  handleValidationErrors
];
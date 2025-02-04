const express = require('express');
const { User } = require('../../db/models');
const bcrypt = require('bcryptjs');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

const validateSignup = [
    check('email')
      .exists({ checkFalsy: true })
      .isEmail()
      .withMessage('Please provide a valid email.'),
    check('username')
      .exists({ checkFalsy: true })
      .isLength({ min: 4 })
      .withMessage('Please provide a username with at least 4 characters.'),
    check('username')
      .not()
      .isEmail()
      .withMessage('Username cannot be an email.'),
    check('password')
      .exists({ checkFalsy: true })
      .isLength({ min: 6 })
      .withMessage('Password must be 6 characters or more.'),
    handleValidationErrors
  ];

router.post('/', validateSignup, async (req, res) => {
  const { email, password, username, firstName, lastName } = req.body;

  //check if email exists
const existingEmail = await User.findOne({
  where: { email }
});

if (existingEmail) {
  return res.status(500).json({
    message: 'User already exists',
    errors: {
      email: 'User with that email already exists'
    }
  });
}

//check if username exists  
const existingUsername = await User.findOne({
  where: { username }
});

if (existingUsername) {
  return res.status(500).json({
    message: 'User already exists', 
    errors: {
      username: 'User with that username already exists'
    }
  });
}
const hashedPassword = bcrypt.hashSync(password);
   const user = await User.create({ 
       email, 
       firstName, 
       lastName, 
       username, 
       hashedPassword 
   });

   const safeUser = {
       id: user.id,
       firstName: user.firstName,
       lastName: user.lastName,
       email: user.email,
       username: user.username,
   };

   await setTokenCookie(res, safeUser);

   return res.status(201).json({
       user: safeUser
   });
});

module.exports = router;
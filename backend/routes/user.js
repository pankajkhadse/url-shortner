const express = require('express')
const router = express.Router()
const {handleUserSignup,handleUserSignin,handleUserLogout} = require('../controllers/user')

router.post('/signup',handleUserSignup)
router.post('/signin',handleUserSignin)
router.post('/logout',handleUserLogout)

module.exports=router 
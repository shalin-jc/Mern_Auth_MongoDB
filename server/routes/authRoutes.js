import express from 'express'
import { getUserData, isAuthenticated, login, logout, register, resetPassword, sendResetOtp, verifyOtp } from '../controllers/authController.js'
import { userAuth } from '../middleware/userAuth.js'
import { upload } from '../middleware/multer-middleware.js'

const authRouter = express.Router()

// authRouter.post('/register',upload.single("avatar"), register)


authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.get('/is-auth', userAuth, isAuthenticated)
authRouter.get('/getuser', userAuth, getUserData)
authRouter.post('/sendOtp', sendResetOtp)
authRouter.post('/verifyOtp', verifyOtp)
authRouter.post('/resetPassword', resetPassword)


export default authRouter;
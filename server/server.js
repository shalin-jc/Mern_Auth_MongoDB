import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import errorMiddleware from './middleware/error-middleware.js';


const app = express();
const PORT = process.env.PORT || 4000;
connectDB()
const allowdOrigins = ['http://localhost:4000', 'http://localhost:5173']

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: allowdOrigins,
    credentials: true,
}))


app.get('/', (req, res) => {
    res.send("server is runing")
})
app.use('/api/auth', authRouter)

app.use(errorMiddleware)

app.listen(PORT, ()=> console.log(`Server is running on port: ${PORT}`)
);
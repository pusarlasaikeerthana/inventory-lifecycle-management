import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
dotenv.config();
const app=express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173'
  })
);
app.use(express.json());
app.get('/api/health',(req,res)=>res.json({status:'ok'}));
app.use('/api',routes);
app.use((err,req,res,next)=>{console.error(err);
res.status(500).json({message:'Internal server error'});});
export default app;

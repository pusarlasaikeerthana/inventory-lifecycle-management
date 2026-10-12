import {pool} from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
export async function login(req,res){
 const {username,password}=req.body;
 if(!username||!password) return res.status(400).json({message:'Username and password are required'});
 const [rows]=await pool.query('SELECT id,name,email,username,password_hash,role FROM users WHERE username=? AND active=1',[username.toLowerCase()]);
 if(!rows.length || !(await bcrypt.compare(password,rows[0].password_hash))) return res.status(401).json({message:'Invalid credentials'});
 const u=rows[0]; const token=jwt.sign({id:u.id,name:u.name,email:u.email,username:u.username,role:u.role},process.env.JWT_SECRET,{expiresIn:'8h'});
 delete u.password_hash; res.json({token,user:u});
}

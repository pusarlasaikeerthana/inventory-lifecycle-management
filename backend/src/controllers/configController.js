import {pool} from '../config/db.js';
export async function dropdowns(req,res){const [rows]=await pool.query('SELECT config_group,config_value FROM dropdown_config WHERE active=1 ORDER BY config_group,sort_order'); const out={}; for(const r of rows)(out[r.config_group]??=[]).push(r.config_value); res.json(out);}
export async function employees(req,res){const [rows]=await pool.query('SELECT id,name,username,email,role FROM users WHERE active=1 ORDER BY name');res.json(rows);}

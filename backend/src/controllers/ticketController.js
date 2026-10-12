import {pool} from '../config/db.js';
export async function tickets(req,res){const [rows]=await pool.query(`SELECT t.*,u.name requester FROM tickets t JOIN users u ON u.id=t.requester_id ORDER BY t.created_at DESC`);res.json(rows);}
export async function updateTicket(req,res){const {status}=req.body; if(!['OPEN','IN_PROGRESS','RESOLVED','CLOSED'].includes(status)) return res.status(400).json({message:'Invalid status'}); await pool.query('UPDATE tickets SET status=?,updated_at=NOW() WHERE id=?',[status,req.params.id]);res.json({message:'Ticket updated'});}

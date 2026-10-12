import {pool} from '../config/db.js';
export async function dashboard(req,res){
 const [[stats]]=await pool.query(`SELECT COUNT(*) total, SUM(status='Active') active, SUM(status='Transfer Pending') transferPending, SUM(status='Removal Pending') removalPending, SUM(status='Removed') removed FROM assets`);
 const [types]=await pool.query(`SELECT asset_type label, COUNT(*) value FROM assets GROUP BY asset_type ORDER BY value DESC`);
 const [recent]=await pool.query(`SELECT at.id,at.action_type,at.created_at,a.serial_number,a.asset_type,u.name actor FROM asset_transactions at JOIN assets a ON a.id=at.asset_id JOIN users u ON u.id=at.actor_id ORDER BY at.created_at DESC LIMIT 8`);
 res.json({stats,types,recent});
}

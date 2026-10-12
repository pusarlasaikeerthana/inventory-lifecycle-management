import {pool} from '../config/db.js';
import {makeTicketId} from '../utils/ticket.js';
import {sendNotification} from '../services/notificationService.js';

async function audit(conn,actor,action,assetId,details){await conn.query('INSERT INTO asset_transactions(asset_id,actor_id,action_type,details) VALUES(?,?,?,?)',[assetId,actor,action,JSON.stringify(details||{})]);await conn.query('INSERT INTO audit_logs(actor_id,entity_type,entity_id,action,details) VALUES(?,?,?,?,?)',[actor,'ASSET',assetId,action,JSON.stringify(details||{})]);}
async function createTicket(conn,actor,action,assetId,description){const [r]=await conn.query('INSERT INTO tickets(requester_id,asset_id,title,description,status) VALUES(?,?,?,?,"OPEN")',[actor,assetId,`${action} request`,description]);const ticketId=makeTicketId(r.insertId);await conn.query('UPDATE tickets SET ticket_code=? WHERE id=?',[ticketId,r.insertId]);return ticketId;}

export async function listAssets(req, res) {
  const { status, search } = req.query;

  let sql = `
    SELECT
      a.*,
      u.name AS owner_name,
      c.name AS custodian_name,
      t.name AS transfer_name
    FROM assets a
    LEFT JOIN users u ON u.id = a.owner_id
    LEFT JOIN users c ON c.id = a.custodian_id
    LEFT JOIN users t ON t.id = a.transfer_to_id
    WHERE 1 = 1
  `;

  const params = [];

  // Admins can see every asset.
  // Normal users can see assets they own, manage, or are receiving.
  if (req.user.role !== 'ADMIN') {
    sql += `
      AND (
        a.owner_id = ?
        OR a.custodian_id = ?
        OR a.transfer_to_id = ?
      )
    `;

    params.push(req.user.id, req.user.id, req.user.id);
  }

  if (status) {
    sql += ' AND a.status = ?';
    params.push(status);
  }

  if (search) {
    sql += `
      AND (
        a.serial_number LIKE ?
        OR a.asset_model LIKE ?
        OR a.asset_type LIKE ?
        OR u.name LIKE ?
      )
    `;

    const query = `%${search}%`;
    params.push(query, query, query, query);
  }

  sql += ' ORDER BY a.updated_at DESC';

  const [rows] = await pool.query(sql, params);
  res.json(rows);
}
export async function getAsset(req, res) {
  try {
    const assetId = Number(req.params.id);

    if (!Number.isInteger(assetId) || assetId <= 0) {
      return res.status(400).json({
        message: 'Invalid asset ID'
      });
    }

    let sql = `
      SELECT
        a.*,
        u.name AS owner_name,
        c.name AS custodian_name,
        t.name AS transfer_name
      FROM assets a
      LEFT JOIN users u ON u.id = a.owner_id
      LEFT JOIN users c ON c.id = a.custodian_id
      LEFT JOIN users t ON t.id = a.transfer_to_id
      WHERE a.id = ?
    `;

    const params = [assetId];

    // Admins can access every asset.
    // Normal users can access only related assets.
    if (req.user.role !== 'ADMIN') {
      sql += `
        AND (
          a.owner_id = ?
          OR a.custodian_id = ?
          OR a.transfer_to_id = ?
        )
      `;

      params.push(req.user.id, req.user.id, req.user.id);
    }

    const [assets] = await pool.query(sql, params);

    if (!assets.length) {
      return res.status(404).json({
        message: 'Asset not found or access denied'
      });
    }

    const [history] = await pool.query(
      `SELECT
         at.*,
         u.name AS actor
       FROM asset_transactions at
       JOIN users u ON u.id = at.actor_id
       WHERE at.asset_id = ?
       ORDER BY at.created_at DESC`,
      [assetId]
    );

    return res.json({
      asset: assets[0],
      history
    });
  } catch (error) {
    console.error('getAsset failed:', error);

    return res.status(500).json({
      message: 'Unable to retrieve asset'
    });
  }
}
export async function addAsset(req,res){const b=req.body;const conn=await pool.getConnection();try{await conn.beginTransaction();const [dup]=await conn.query('SELECT id FROM assets WHERE serial_number=?',[b.serialNumber]);if(dup.length)throw new Error('Serial number already exists');const [u]=await conn.query('SELECT id FROM users WHERE username=? AND active=1',[String(b.ownerUsername||'').toLowerCase()]);if(!u.length)throw new Error('Owner not found');const [r]=await conn.query(`INSERT INTO assets(serial_number,asset_type,make,asset_model,status,owner_id,custodian_id,team,location,device_category,imei,mobile_number,sim_managed_by,sim_country,reason,comments) VALUES(?,?,?,?, 'Active',?,?,?,?,?,?,?,?,?,?,?)`,[b.serialNumber,b.assetType,b.make,b.assetModel,u[0].id,b.custodianId||null,b.team,b.location,b.deviceCategory||null,b.imei||null,b.mobileNumber||null,b.simManagedBy||null,b.simCountry||null,b.reason||null,b.comments||null]);const ticket=await createTicket(conn,req.user.id,'Add',r.insertId,`Asset ${b.serialNumber} added to inventory.`);await audit(conn,req.user.id,'ADD',r.insertId,{serial:b.serialNumber,ticket});await conn.commit();await sendNotification({to:[u[0].id],subject:`Asset added: ${b.serialNumber}`,body:`Ticket ${ticket}`});res.status(201).json({message:'Asset added',ticketId:ticket});}catch(e){await conn.rollback();res.status(400).json({message:e.message});}finally{conn.release();}}
export async function transferAsset(req,res){const {targetUsername,newTeam,newLocation}=req.body;const conn=await pool.getConnection();try{await conn.beginTransaction();const [a]=await conn.query('SELECT * FROM assets WHERE id=? FOR UPDATE',[req.params.id]);if(!a.length)throw new Error('Asset not found');// Only the asset owner or an admin can initiate a transfer.
if (
  req.user.role !== 'ADMIN' &&
  Number(a[0].owner_id) !== Number(req.user.id)
) {
  await conn.rollback();

  return res.status(403).json({
    message: 'You can only transfer assets you own'
  });
}
if(a[0].status!=='Active')throw new Error('Only active assets can be transferred');const [u]=await conn.query('SELECT id FROM users WHERE username=? AND active=1',[String(targetUsername).toLowerCase()]);if(!u.length)throw new Error('Target user not found');await conn.query('UPDATE assets SET status="Transfer Pending",transfer_to_id=?,pending_team=?,pending_location=?,updated_at=NOW() WHERE id=?',[u[0].id,newTeam||a[0].team,newLocation||a[0].location,req.params.id]);const ticket=await createTicket(conn,req.user.id,'Transfer',req.params.id,`Transfer ${a[0].serial_number} to ${targetUsername}.`);await audit(conn,req.user.id,'TRANSFER_REQUEST',req.params.id,{to:targetUsername,ticket});await conn.commit();res.json({message:'Transfer requested',ticketId:ticket});}catch(e){await conn.rollback();res.status(400).json({message:e.message});}finally{conn.release();}}
export async function confirmReceipt(req,res){const conn=await pool.getConnection();try{await conn.beginTransaction();const [a]=await conn.query('SELECT * FROM assets WHERE id=? FOR UPDATE',[req.params.id]);if(!a.length||a[0].status!=='Transfer Pending')throw new Error('Transfer request not found');if(a[0].transfer_to_id!==req.user.id)throw new Error('Only the target user can confirm receipt');await conn.query('UPDATE assets SET status="Active",owner_id=transfer_to_id,transfer_to_id=NULL,team=COALESCE(pending_team,team),location=COALESCE(pending_location,location),pending_team=NULL,pending_location=NULL,updated_at=NOW() WHERE id=?',[req.params.id]);await audit(conn,req.user.id,'CONFIRM_RECEIPT',req.params.id,{});await conn.commit();res.json({message:'Receipt confirmed'});}catch(e){await conn.rollback();res.status(400).json({message:e.message});}finally{conn.release();}}
export async function removeAsset(req,res){const conn=await pool.getConnection();try{await conn.beginTransaction();const [a]=await conn.query('SELECT * FROM assets WHERE id=? FOR UPDATE',[req.params.id]);if(!a.length)throw new Error('Asset not found');// Normal users may request removal only for assets
// they own or manage as a custodian. Admins can remove any asset.
if (
  req.user.role !== 'ADMIN' &&
  Number(a[0].owner_id) !== Number(req.user.id) &&
  Number(a[0].custodian_id) !== Number(req.user.id)
) {
  await conn.rollback();

  return res.status(403).json({
    message: 'You can only request removal for assets you own or manage'
  });
}const final=req.user.role==='ADMIN'?'Removed':'Removal Pending';await conn.query('UPDATE assets SET status=?,updated_at=NOW() WHERE id=?',[final,req.params.id]);let ticket='';if(final==='Removal Pending')ticket=await createTicket(conn,req.user.id,'Remove',req.params.id,`Removal request for ${a[0].serial_number}.`);else {ticket=await createTicket(conn,req.user.id,'Remove',req.params.id,`Admin removed ${a[0].serial_number}.`);await conn.query('UPDATE assets SET custodian_id=NULL WHERE id=?',[req.params.id]);}await audit(conn,req.user.id,'REMOVE',req.params.id,{finalStatus:final,ticket});await conn.commit();res.json({message:final==='Removed'?'Asset removed':'Removal request created',ticketId:ticket});}catch(e){await conn.rollback();res.status(400).json({message:e.message});}finally{conn.release();}}
export async function assignCustodian(req,res){const {custodianUsername}=req.body;const conn=await pool.getConnection();try{await conn.beginTransaction();const [u]=await conn.query('SELECT id FROM users WHERE username=? AND active=1',[String(custodianUsername).toLowerCase()]);if(!u.length)throw new Error('Custodian not found');const [a]=await conn.query('SELECT * FROM assets WHERE id=? FOR UPDATE',[req.params.id]);if(!a.length)throw new Error('Asset not found');// Only an admin or the asset owner can assign a custodian.
if (
  req.user.role !== 'ADMIN' &&
  Number(a[0].owner_id) !== Number(req.user.id)
) {
  await conn.rollback();

  return res.status(403).json({
    message: 'You can only assign a custodian to assets you own'
  });
}if(a[0].custodian_id===u[0].id)throw new Error('User is already the custodian');await conn.query('UPDATE assets SET custodian_id=?,updated_at=NOW() WHERE id=?',[u[0].id,req.params.id]);await audit(conn,req.user.id,'ASSIGN_CUSTODIAN',req.params.id,{custodian:custodianUsername});await conn.commit();res.json({message:'Custodian updated'});}catch(e){await conn.rollback();res.status(400).json({message:e.message});}finally{conn.release();}}
export async function approvals(req,res){const [rows]=await pool.query(`SELECT a.id,a.serial_number,a.asset_type,a.status,a.transfer_to_id,u.name owner_name,t.name transfer_name FROM assets a LEFT JOIN users u ON u.id=a.owner_id LEFT JOIN users t ON t.id=a.transfer_to_id WHERE a.status IN ('Transfer Pending','Removal Pending') ORDER BY a.updated_at DESC`);res.json(rows);}
export async function approve(req,res){const conn=await pool.getConnection();try{await conn.beginTransaction();const [a]=await conn.query('SELECT * FROM assets WHERE id=? FOR UPDATE',[req.params.id]);if(!a.length)throw new Error('Asset not found');if(a[0].status!=='Removal Pending')throw new Error('Only removal approvals can be approved here');await conn.query('UPDATE assets SET status="Removed",custodian_id=NULL,updated_at=NOW() WHERE id=?',[req.params.id]);await audit(conn,req.user.id,'APPROVE_REMOVAL',req.params.id,{});await conn.commit();res.json({message:'Removal approved'});}catch(e){await conn.rollback();res.status(400).json({message:e.message});}finally{conn.release();}}
export async function reject(req,res){const conn=await pool.getConnection();try{await conn.beginTransaction();const [a]=await conn.query('SELECT * FROM assets WHERE id=? FOR UPDATE',[req.params.id]);if(!a.length)throw new Error('Asset not found');if(!['Removal Pending','Transfer Pending'].includes(a[0].status))throw new Error('No pending action');await conn.query('UPDATE assets SET status="Active",transfer_to_id=NULL,pending_team=NULL,pending_location=NULL,updated_at=NOW() WHERE id=?',[req.params.id]);await audit(conn,req.user.id,'REJECT_ACTION',req.params.id,{reason:req.body.reason||''});await conn.commit();res.json({message:'Pending action rejected'});}catch(e){await conn.rollback();res.status(400).json({message:e.message});}finally{conn.release();}}

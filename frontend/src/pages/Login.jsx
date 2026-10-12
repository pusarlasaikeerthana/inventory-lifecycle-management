import {useState} from 'react';import{useAuth}from'../context/AuthContext';
export default function Login(){const{login}=useAuth();
const[u,setU]=useState('admin'),[p,setP]=useState('Password@123'),[e,setE]=useState('');
async function go(x){
    x.preventDefault();
    try{
        await login(u,p)
    }catch(e){
        setE(e.message)
    }}
    return <div className="login">
        <div className="login-card">
            <div className="brand-mark">◈
                </div><h1>Holocron</h1>
                <p>Inventory Lifecycle Management</p>
                <form onSubmit={go}>
                    <label>Username</label>
                    <input value={u}
                     onChange={e=>setU(e.target.value)}/>
                     <label>Password</label>
                     <input type="password"
                     value={p}
                     onChange={e=>setP(e.target.value)}/>
                     {e&&<div className="error">{e}</div>}
                     <button className="primary full">Sign in</button>
                     </form><div className="demo">Demo: <b>admin</b> / <b>Password@123</b></div></div></div>}

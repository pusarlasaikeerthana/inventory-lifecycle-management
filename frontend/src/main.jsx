import React from 'react';
import{createRoot}from'react-dom/client';
import'./styles.css';
import{AuthProvider,useAuth}from'./context/AuthContext';
import Login from'./pages/Login';
import Dashboard from'./pages/Dashboard';
function App(){
    const{user}=useAuth();
    return user?<Dashboard/>:<Login/>}
    createRoot(document.getElementById('root')).render(<AuthProvider><App/></AuthProvider>);

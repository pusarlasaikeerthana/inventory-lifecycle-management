export function makeTicketId(id){return `TKT-${new Date().getFullYear()}-${String(id).padStart(5,'0')}`;}

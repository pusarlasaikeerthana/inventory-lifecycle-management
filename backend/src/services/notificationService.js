export async function sendNotification({to=[],subject,body}){
  // Portfolio-safe notification adapter. Replace this service with SMTP/SendGrid/Resend later.
  console.log('[MOCK EMAIL]',{to,subject,body});
  return {status:'SIMULATED',recipients:to};
}

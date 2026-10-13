import app from './app.js';
import dotenv from 'dotenv';
dotenv.config();
const port = Number(process.env.PORT || 5000);

app.listen(port, '0.0.0.0', () => {
  console.log(`Inventory API listening on port ${port}`);
});

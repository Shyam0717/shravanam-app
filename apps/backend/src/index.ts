import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import lecturesRouter from '../routes/lectures';
import summarizeRoutes from '../routes/summarize';
import sbRouter from '../routes/sb';
import nodRouter from '../routes/nod';
import streakRouter from '../routes/streak';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// BG lectures (existing)
app.use('/lectures', lecturesRouter);
app.use('/lectures', summarizeRoutes);

// SB lectures
app.use('/sb', sbRouter);

// NOD lectures
app.use('/nod', nodRouter);

// Streak tracking
app.use('/streak', streakRouter);

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
  console.log(`   📖 BG Lectures: /lectures`);
  console.log(`   📕 SB Lectures: /sb`);
  console.log(`   📗 NOD Lectures: /nod`);
  console.log(`   🔥 Streak: /streak`);
});

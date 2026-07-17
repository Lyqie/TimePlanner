import app from './app';

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`⚡ Time Planner API 运行于 http://localhost:${PORT}`);
});

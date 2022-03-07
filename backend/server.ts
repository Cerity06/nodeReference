import { port } from './../helpers/process';
import app from './routes/userRoutes';

const hostname = '127.0.0.1';

app.listen(+port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

module.exports = app;

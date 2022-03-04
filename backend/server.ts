const app = require('./api');
const port = process.env.PORT ?? 8080;
const hostname = '127.0.0.1';

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

import express, { Response } from 'express';
import { setInterval } from 'timers';

const app = express();
const PORT = 8080;

interface Client {
  id: number;
  response: Response;
}

let clients: Client[] = [];
let facts: any[] = [];

app.use(express.json());

app.get('/status', (_, res) => res.json({ client: clients.length }));

app.get('/events', (req, res) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };

  res.writeHead(200, headers);

  let i = 0;
  setInterval(() => {
    if (i >= facts.length) {
      res.end();
      return;
    }

    const data = `data: ${JSON.stringify(facts[i])}\n\n`;

    res.write(data);

    i++;
  }, 1000);

  const clientId = Date.now();

  const newClient = {
    id: clientId,
    response: res,
  };

  clients.push(newClient);

  req.on('close', () => {
    console.log(`${clientId} connection closed`);
    clients = clients.filter((client) => client.id !== clientId);
  });
});

app.post('/fact', async (req, res) => {
  const newFact = req.body;
  facts.push(newFact);
  res.json(newFact);
  clients.forEach((client) =>
    client.response.write(`data: ${JSON.stringify(newFact)}\n\n`),
  );
});

app.listen(PORT, () => {
  console.log(`app is running on port ${PORT}`);
});

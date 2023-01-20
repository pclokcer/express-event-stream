import express from 'express'
import axios, { AxiosRequestConfig } from 'axios'

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', (req, res) => {

  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // flush the headers to establish SSE with client

  let counter = 0;
  let interValID = setInterval(() => {
    counter++;
    if (counter >= 5) {
      clearInterval(interValID);
      res.end(); // terminates SSE session
      return;
    }
    res.write(`data: ${JSON.stringify({ num: counter })}\r\n`); // res.write() instead of res.send()
  }, 1000);

  // If client closes connection, stop sending events
  res.on('close', () => {
    console.log('client dropped me');
    clearInterval(interValID);
    res.end();
  });
});

app.listen(3000, () => console.log("backend app listening on port " + 3000))


// Testing
setTimeout(async () => {
  const config = {
    url: 'http://localhost:3000',
    method: 'GET',
    responseType: 'stream',
    headers: {
      'content-type': 'text/event-stream'
    }
  } as AxiosRequestConfig

  const response = await axios.request(config)

  const stream = response.data;

  stream.on('data', data => {
    console.log(data.toString());
  });

  stream.on('end', () => {
    console.log("stream done");
  });
}, 2000);

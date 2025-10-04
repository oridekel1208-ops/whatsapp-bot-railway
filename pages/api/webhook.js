if (req.method === 'GET') {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log("Received mode:", mode);
  console.log("Received token:", token);
  console.log("Expected token:", process.env.META_VERIFY_TOKEN);

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.status(403).send(`Verification failed: token=${token}, expected=${process.env.META_VERIFY_TOKEN}`);
  }
}

const { v4: uuidv4 } = require("uuid");

const codeExecutionQueue = "rpcCodeExecutionQueue";
// Publish message to queue
async function publishMessageToCodeExecutionQueue(
  connection,
  channel,
  id,
  code,
  language,
  tc,
  isSubmitting,
  res
) {
  const correlationId = uuidv4();
  // set up responsequeue (temp)
  const responseQueue = await channel.assertQueue("", { exclusive: true });
  const responseQueueName = responseQueue.queue;

  // publish msg(code) to rpccodeExecutionQueue / send rcp request
  channel.sendToQueue(
    codeExecutionQueue,
    Buffer.from(JSON.stringify({ id, code, language, tc, isSubmitting })),
    {
      correlationId,
      replyTo: responseQueueName,
    }
  );

  // consumer from the response queue
  channel.consume(
    responseQueueName,
    (msg) => {
      if (msg.properties.correlationId == correlationId) {
        const result = JSON.parse(msg.content.toString());
        res.status(200).json(result);
        channel.close();
        connection.close();
      }
    },
    { noAck: true }
  );
}

module.exports = { publishMessageToCodeExecutionQueue };

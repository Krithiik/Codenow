const { connectRabbitMQ } = require("./config");
const { executeTestCodeInContainer } = require("../code execution/executeCode");
const codeExecutionQueue = "rpcCodeExecutionQueue";

async function startRpcServerAsWorker() {
  const { connection, channel } = await connectRabbitMQ();
  channel.prefetch(1); // limit the no. of unack msg, fetch only one msg
  channel.assertQueue(codeExecutionQueue);

  // consumer for rpcCodeExecutionQueue
  channel.consume(codeExecutionQueue, async (msg) => {
    const { id, code, language, tc, isSubmitting } = JSON.parse(
      msg.content.toString()
    );
    try {
      // process the rcp request / execute code inside container

      const executionResult = await executeTestCodeInContainer(
        id,
        code,
        language,
        tc,
        isSubmitting
      );

      // publish the result to the response queue
      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(executionResult)),
        {
          correlationId: msg.properties.correlationId,
        }
      );

      // acknowledge the message (dqueue)
      channel.ack(msg);
    } catch (err) {
      console.log("Error processing RCP request for execution: ", err);
      process.exit(1); // terminate
    }
  });
}

module.exports = { startRpcServerAsWorker };

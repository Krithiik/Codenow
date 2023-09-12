// Connect to rabbit mq
const amqp = require("amqplib");

async function connectRabbitMQ() {
  const connection = await amqp.connect("amqp://localhost:5672");
  const channel = await connection.createChannel();
  return { connection, channel };
}

module.exports = { connectRabbitMQ };

const express = require("express");
const app = express();
const port = 3010;
const cors = require("cors");
const docker = new require("dockerode")();
const cluster = require("cluster");
const os = require("os");
const mongoose = require("mongoose");
var bodyParser = require("body-parser");
const Problems = require("./models/problems");
const { connectRabbitMQ } = require("./rabbitmq/config.js");
const { startRpcServerAsWorker } = require("./rabbitmq/rpcServer.js");
const {
  publishMessageToCodeExecutionQueue,
} = require("./rabbitmq/rpcClient.js");

/// ------------- MIDDLEWARES ------------------

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
mongoose
  .connect("mongodb://localhost:27017/codeExecute", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MONGO CONNECTION OPEN!!!");
  })
  .catch((err) => {
    console.log("OH NO MONGO CONNECTION ERROR!!!!");
    console.log(err);
  });

//----------------------------ROUTES-----------------------------
app.get("/", async (req, res) => {
  res.send("This is Home page. Try /problemset to start solving");
});
app.get("/problems", async (req, res) => {
  const problems = await Problems.find({});
  res.status(200).json({ problems });
});

app.post("/problems", async (req, res) => {
  console.log(req.body);
  const newProblem = new Problems(req.body);
  await newProblem.save();
  res.status(200).json({ newProblem });
});

app.get("/problems/:id", async (req, res) => {
  const { id } = req.params;
  const problem = await Problems.findById(id);
  res.status(200).json({ problem });
});

app.post("/submissions/:id", async (req, res) => {
  let body = req.body;
  const { id } = req.params;
  console.log("Request received");
  console.log(req.body);
  console.log(id);
  let userSubmittedCode = body.submission.code;
  let codeLanguage = body.submission.language;
  let tc = body.submission.tc;
  let isSubmitting = body.submission.submit;

  try {
    const { connection, channel } = await connectRabbitMQ();
    await publishMessageToCodeExecutionQueue(
      connection,
      channel,
      id,
      userSubmittedCode,
      codeLanguage,
      tc,
      isSubmitting,
      res
    );
  } catch (er) {
    console.log("Error Publishing message to RcpCodeExecution queue", er);
    res.status(500).json({ err: "Somethig Went Wrong" });
  }
});

/// ------------- SCALE USING CLUSTER ----------------

// get cpu threads
let cpuThreads = os.cpus().length; // 12 (my i5 12400)
if (cpuThreads >= 4) cpuNum = 4; // limit worker to 4

if (cluster.isMaster) {
  for (let i = 0; i < cpuNum; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} exited`);
    cluster.fork();
  });
} else {
  startRpcServerAsWorker();

  const server = app.listen(port, () => {
    console.log(`server ${process.pid} is listening on port ${port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.log(`Port ${port} is already in use`);
    } else {
      console.error("An error occurred:", error);
    }
  });
}

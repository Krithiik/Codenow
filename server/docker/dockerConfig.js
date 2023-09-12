const docker = new require("dockerode")();

// helper fun to get image according to user Selected language
function getDockerImage(language) {
  let image;

  switch (language) {
    case "cpp":
      image = "gcc";
      break;
    case "js":
      image = "node";
      break;
    case "c":
      image = "gcc";
      break;
    case "python":
      image = "python";
      break;
    case "java":
      image = "openjdk";
      break;
    default:
      throw new Error(`unsupported language: ${language}`);
  }

  return image;
}

// helper fun to get Execution command acc... to user selected language
function getExecutionCommand(codeTemplate, language, code, testCaseArray) {
  console.log("Received testcases");
  console.log(testCaseArray);

  if (typeof testCaseArray == "object") {
    var tc = "";
    for (i in testCaseArray) {
      tc = tc + testCaseArray[i].toString() + "\n";
    }
    tc = tc.substring(0, tc.length - 1);
  } else {
    tc = testCaseArray.replace(" ", "\n");
  }
  console.log("testing.." + tc);

  switch (language) {
    case "cpp":
      code =
        codeTemplate.cpp[0].driverStart + code + codeTemplate.cpp[0].driverEnd;
      cmd = [
        "bash",
        "-c",
        `echo "${code}" > myapp.cpp && echo "${tc}" > inputs.txt && g++ -o myapp myapp.cpp && ./myapp < inputs.txt`,
      ];
      break;
    case "python":
      code =
        codeTemplate.python[0].driverStart +
        "\n" +
        code +
        "\n" +
        codeTemplate.python[0].driverEnd;
      cmd = [
        "bash",
        "-c",
        `echo "${code}" > myapp.py && echo "${tc}" > inputs.txt && python3 myapp.py < inputs.txt`,
      ];
      break;
    case "java":
      code =
        codeTemplate.java[0].driverStart +
        code +
        codeTemplate.java[0].driverEnd;
      cmd = [
        "bash",
        "-c",
        `echo "${code}" > myapp.java && echo "${tc}" > inputs.txt && javac myapp.java && java myapp < inputs.txt`,
      ];
      break;
    default:
      throw new Error(`unsupported language: ${language}`);
  }

  return cmd;
}

// Create container according to user selected language
async function createDockerContainer(codeTemplate, language, code, tc) {
  const containerConfig = {
    Image: getDockerImage(language), //node
    Cmd: getExecutionCommand(codeTemplate, language, code, tc), // ["node", "-e", code]
    Tty: true,
    // HostConfig: {
    //   StopTimeout: 2, // Stop the container after 2 seconds
    // },
  };

  // same as docker create --image imageName --tty --command cmdToRun
  const container = await docker.createContainer(containerConfig);

  return container;
}

module.exports = { createDockerContainer };

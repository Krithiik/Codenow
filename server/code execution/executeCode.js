const Problems = require("../models/problems");
const { createDockerContainer } = require("../docker/dockerConfig.js");

async function executeUserCodeInContainer(problem, code, language, tc) {
  return new Promise(async (resolve, reject) => {
    console.log("executing code");

    const container = await createDockerContainer(
      problem.codeTemplate,
      language,
      code,
      tc
    );
    await container.start();

    //send a TLE after 2sec
    const tle = setTimeout(async () => {
      console.log("sending a tle");
      resolve({
        result: "Time Limit Exceed!! ",
        sucess: false,
      });
      await container.stop();
    }, 10000);

    const containerExitStatus = await container.wait(); // wait for container to exit

    // get logs
    const logs = await container.logs({ stdout: true, stderr: true });
    console.log(logs);
    // return output/error
    if (containerExitStatus.StatusCode === 0) {
      resolve({ result: logs.toString(), success: true });
      clearTimeout(tle);
      await container.remove();
    } else {
      resolve({ result: logs.toString(), success: false });
      clearTimeout(tle);
      await container.remove();
    }
  });
}

async function executeTestCodeInContainer(
  id,
  code,
  language,
  tc,
  isSubmitting
) {
  let problem = await Problems.findById(id);
  var testcases;
  if (isSubmitting) {
    const NotVisibleCases = problem.invisibleTestcases;
    const VisibleCases = problem.visibleTestcases;
    testcases = [...VisibleCases, ...NotVisibleCases];
  } else {
    testcases = tc;
  }
  console.log("On executeTestcodeInContainer");
  console.log(testcases);
  var resultsOnVisibleTests = [];

  return new Promise(async (resolve, reject) => {
    for (let testcase of testcases) {
      if ("input" in testcase && "output" in testcase) {
        //get the input and output form the testcase
        const { input, output } = testcase;

        // Execute the user provided code
        const executionResult = await executeUserCodeInContainer(
          problem,
          code,
          language,
          input
        );

        // compare the execution resut
        const isPassed = await compareResult(executionResult.result, output);

        // return the 1st failed testcase
        if (!isPassed)
          return resolve({
            result: executionResult.result,
            input,
            output,
          });
      } else {
        const { input } = testcase;

        // Execute the user provided code
        const executionResult = await executeUserCodeInContainer(
          problem,
          code,
          language,
          input
        );

        resultsOnVisibleTests.push(executionResult);
      }
    }

    // if everything passed
    if (isSubmitting) {
      resolve({ result: "Passed All test cases!!", success: true });
    } else {
      resolve({ result: resultsOnVisibleTests });
    }
  });
}

async function compareResult(executionResult, output) {
  // parsing the the result to remove the asci escae scequences
  executionResult = executionResult
    .replace(/\x1B\[[0-9;]*[mG]/g, "")
    .replace(/[\r\n]/g, "");

  console.log("comparing", executionResult, "and", output);

  if (executionResult != output) {
    console.log("not same \n");
    return false;
  } else {
    console.log("same \n");
    return true;
  }
}

module.exports = { executeTestCodeInContainer };

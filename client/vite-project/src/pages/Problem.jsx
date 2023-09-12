import styled from "styled-components";

import { useNavigate, useSearchParams } from "react-router-dom";
import { ProgressBar } from "react-loader-spinner";
import { useState } from "react";
import { useEffect } from "react";
import CodeEditor from "./components/CodeEditor";

export default function Problem() {
  const [searchParams] = useSearchParams();
  const pid = searchParams.get("pid");
  const [problem, setProblem] = useState(null);

  const [defaultCode, setDefaultCode] = useState("");
  const [language, setLanguage] = useState("");
  const [code, setCode] = useState("");
  const [isProgressVisible, setisProgressVisible] = useState(false);

  const init = async () => {
    const response = await fetch(`http://localhost:3010/problems/` + pid, {
      headers: {},
      method: "GET",
    });

    //set inital datat on frontend
    await response.json().then((data) => {
      console.log(data);
      setProblem(data.problem);
      setLanguage("cpp");
      setDefaultCode(data.problem.codeTemplate.cpp[0].codeStart);
      setCode(data.problem.codeTemplate.cpp[0].codeStart);

      let tc1 = document.getElementById("tc1");
      let tc2 = document.getElementById("tc2");
      let tc3 = document.getElementById("tc3");
      tc1.value = data.problem.visibleTestcases[0].input;
      tc2.value = data.problem.visibleTestcases[1].input;
      tc3.value = data.problem.visibleTestcases[2].input;
    });
  };

  useEffect(() => {
    init();
  }, []);

  const handleLangChange = (e) => {
    setLanguage(e.target.value);
    switch (e.target.value) {
      case "cpp":
        setDefaultCode(problem.codeTemplate.cpp[0].codeStart);
        break;
      case "java":
        setDefaultCode(problem.codeTemplate.java[0].codeStart);
        break;
      case "python":
        setDefaultCode(problem.codeTemplate.python[0].codeStart);
        break;

      default:
        break;
    }
  };

  let outputBox = document.getElementsByClassName("output")[0];

  async function processRequest(isSubmitting) {
    outputBox.innerText = "Executing...";
    outputBox.style.color = "white";
    setCode(parseCode(code));
    // hit the /submission
    let data = {
      problemId: pid,
      submission: {
        language: language,
        code: code,
        submit: isSubmitting,
        tc: [{ input: tc1.value }, { input: tc2.value }, { input: tc3.value }],
      },
    };
    let options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(data),
    };
    let res = await fetch("http://localhost:3010/submissions/" + pid, options);
    // get the output as a response from the server
    let output = await res.json();
    console.log("result:");
    console.log(output);

    if (!isSubmitting) {
      var outputText = "";
      for (let i in output.result) {
        console.log(output.result[i].result);
        outputText +=
          `TestCase ${parseInt(i) + 1} : ` +
          parseLogs(output.result[i].result) +
          "\n";
      }
      outputBox.innerText = outputText;
    } else {
      outputBox.innerText =
        output.input != undefined
          ? `Last testcase: ` +
            "\n" +
            `Input: ${output.input}` +
            "\n" +
            "Error \n" +
            parseLogs(output.result)
          : parseLogs(output.result);
    }
    // change color according to sucess status
    if (output.success) {
      outputBox.style.color = "green";
      outputBox.scrollTop = outputBox.scrollHeight; // scroll to bottom
    } else {
      outputBox.style.color = "lightcoral";
      outputBox.scrollTop = outputBox.scrollHeight; // scroll to bottom
    }

    // hide terminal heading
    //document.querySelector(".output h4").style.display = "none";
  }

  async function runCode() {
    setisProgressVisible(true);
    await processRequest(false);
    setisProgressVisible(false);
  }

  async function submitCode() {
    await processRequest(true);
  }

  function parseCode(code) {
    if (
      language == "c" ||
      language == "cpp" ||
      language == "py" ||
      language == "java"
    ) {
      return code.replace(/"/g, '\\"');
    } else {
      return code;
    }
  }

  function parseLogs(logs) {
    if (language == "js") {
      return logs
        .replace(/\[90m/g, "... ")
        .replace(/\[39m/g, "")
        .replace(/\[33m/g, "");
    } else if (language == "c" || language == "cpp") {
      console.log("i am working");
      return logs
        .toString()
        .replace(/\x1B\[[0-9;]*[m]/g, "")
        .replace(/\[K/g, "");
    } else {
      return logs;
    }
  }

  //prepare example text
  const examples = problem
    ? problem.visibleTestcases.map((testcase) => (
        <div className="examples">
          <p>Input: {testcase.input} </p> <p>Output: {testcase.output}</p>
        </div>
      ))
    : "No examples";

  return (
    <>
      <StyledDiv>
        <div className="parentlayout">
          <h2 id="title">
            {" "}
            {problem ? `${problem.title}` : "Title Not Found"}{" "}
          </h2>
          <p id="info">
            {" "}
            {problem ? problem.description : " description not found "}{" "}
          </p>
          <h3 className="ex">Examples</h3>
          <div>{examples}</div>

          <h3 className="ex"> Run sample testcases</h3>
          <div className="block">
            <p>Test case 1</p>
            <input type="text" name="tc1" id="tc1"></input>
            <p>Test case 2</p>
            <input type="text" name="tc2" id="tc2"></input>
            <p>Test case 3</p>
            <input type="text" name="tc3" id="tc3"></input>
          </div>
        </div>

        <div className="parentlayout grid2">
          <div className="codespace">
            <select name="language" id="language" onChange={handleLangChange}>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
            </select>

            <div id="code-editor">
              {defaultCode && language ? (
                <CodeEditor
                  defaultCode={defaultCode}
                  language={language}
                  setCode={setCode}
                />
              ) : (
                "Template Not Provided"
              )}
            </div>

            <div className="action">
              <button onClick={runCode}>Run</button>
              <button className="submit" onClick={submitCode}>
                Submit
              </button>
            </div>
          </div>

          <div id="output-box-1" className="output">
            Terminal (Read Only)
          </div>
        </div>
      </StyledDiv>
    </>
  );
}

const StyledDiv = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  p {
    padding: 4px;
  }
  .examples {
    margin: 10px;
  }
  .parentlayout {
    border: 2px solid #f0f0f0;
    padding: 20px;
    border-radius: 10px;
    overflow-x: hidden;
    overflow-y: scroll;
    height: calc(100vh - 140px);

    .block {
      padding: 10px;
      background-color: #03001c;
      border-radius: 10px;
      color: #f0f0f0;
    }
  }
  .grid2 {
    display: flex;
    flex-direction: column;
    gap: 30px;

    .codespace {
      button {
        padding: 5px 10px;
        border: none;
        border-radius: 7px;
        background-color: #e9e9ed;
        color: black;
      }
      select {
        padding: 2px 10px;
        border: none;
        border-radius: 7px;
        background-color: #e9e9ed;
      }
      .submit {
        background-color: #0084ff;
        color: white;
      }

      .action {
        display: flex;
        justify-content: flex-end;
        gap: 15px;
      }
    }

    #code-editor {
      height: calc(100vh - 500px);
      width: calc(100% + 20px);
      animation: none;
      margin-left: -20px;
      font-family: "Courier New", Courier, monospace;
      padding-top: 15px;
      padding-bottom: 15px;
    }

    #code-editor * {
      animation: none !important;
      font-family: "Courier New", Courier, monospace;
    }

    #output-box-1 {
      background-color: #03001c;
      color: white;
      height: 250px;
      overflow-y: scroll;
      padding: 15px;
      border-radius: 10px;
    }
  }
`;

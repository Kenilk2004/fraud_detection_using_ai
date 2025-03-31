const { spawn } = require("child_process");

exports.runFraudDetection = (transactions) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python3", ["../ai/finalai.py"]); // Adjust path if needed

    // Send transactions to the Python script
    pythonProcess.stdin.write(JSON.stringify(transactions));
    pythonProcess.stdin.end();

    let result = "";
    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error("Python error:", data.toString());
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        resolve(JSON.parse(result)); // Parse the result from Python
      } else {
        reject(new Error("Python script failed"));
      }
    });
  });
};
const spawn = require('child_process').spawn;
const os = require('os');

let cmd;
if (os.platform() === 'win32') {
    cmd = 'npm.cmd'
} else {
    cmd = 'npm'
}

let startCmd;
if (process.env.ENVIRONMENT === "DEV"){
    startCmd = "build-prd";
}
if (process.env.ENVIRONMENT === "PRD"){
    startCmd = "build-prd";
}

if (!startCmd){
    console.error("You have to set environment in environment variables");
}


const command = spawn(cmd, ["run", startCmd, "--prefix", "wik-frontend"]);

command.stdout.on('data', function (data) {
    console.log('stdout: ' + data.toString());
});

command.stderr.on('data', function (data) {
    console.log('stderr: ' + data.toString());
});

command.on('exit', function (code) {
    console.log('child process exited with code ' + code.toString());
});

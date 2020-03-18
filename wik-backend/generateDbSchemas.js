const spawn = require('child_process').spawn;
const os = require('os');


let cmd;
if (os.platform() === 'win32') {
    cmd = 'schemats.cmd'
} else {
    cmd = 'schemats'
}

const command = spawn(cmd, ["generate", "-c", process.env["POSTGRES-CONN"], "-s", "public" ,"-o", "src/db/DatabaseMapping.ts"]);

command.stdout.on('data', function (data) {
    console.log('stdout: ' + data.toString());
});

command.stderr.on('data', function (data) {
    console.log('stderr: ' + data.toString());
});

command.on('exit', function (code) {
    console.log('child process exited with code ' + code.toString());
});
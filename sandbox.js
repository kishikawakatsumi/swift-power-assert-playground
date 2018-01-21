'use strict';

const Sandbox = function(timeout_value, path, folder, filename, code) {
  this.timeout_value = timeout_value;
  this.path = path;
  this.folder = folder;
  this.filename = filename;
  this.code = code;
}

Sandbox.prototype.run = function(success) {
  const sandbox = this;
  this.prepare(function() {
    sandbox.execute(success);
  });
}

Sandbox.prototype.prepare = function(success) {
  const exec = require('child_process').exec;
  const fs = require('fs');
  const path = require('path');
  const sandbox = this;

  const work_dir = path.join(this.path, this.folder);
  const cmd = ['mkdir', work_dir, '&&', 'cp', path.join(this.path, "script.sh"), work_dir, '&&', 'chmod', '777', work_dir];
  exec(cmd.join(' '), function(error) {
    if (error) {
      console.log(error);
    } else {
      fs.writeFile(path.join(sandbox.path, sandbox.folder, sandbox.filename), sandbox.code, function(error) {
        if (error) {
          console.log(error);
        } else {
          success();
        }
      });
    }
  });
}

Sandbox.prototype.execute = function(success) {
  const exec = require('child_process').exec;
  const fs = require('fs');
  const path = require('path');

  const sandbox = this;
  let counter = 0;

  const cmd = ['sh', path.join(this.path, "run.sh"), this.timeout_value + 's', '-v', path.join(this.path, this.folder) + ':/usercode kishikawakatsumi/swift-power-assert', 'sh', '/usercode/script.sh']
  exec(cmd.join(' '));

  const intid = setInterval(function() {
    counter = counter + 1;
    const work_dir = path.join(sandbox.path, sandbox.folder)
    fs.readFile(path.join(work_dir, 'completed'), 'utf8', function(error, data) {
      if (error && counter < sandbox.timeout_value) {
        return;
      } else if (counter < sandbox.timeout_value) {
        fs.readFile(path.join(work_dir, 'errors'), 'utf8', function(error, errorlog) {
          if (!errorlog) {
            errorlog = ""
          }
          success(data, errorlog);
        });
      } else {
        fs.readFile(path.join(work_dir, 'errors'), 'utf8', function(error, errorlog) {
          if (!errorlog) {
            errorlog = ""
          }
          success(data, errorlog)
        });
      }
      exec("rm -r " + sandbox.folder);
      clearInterval(intid);
    });
  }, 1000);
}

module.exports = Sandbox;

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
  const sandbox = this;
  const cmd = "mkdir " + this.path + this.folder + " && cp " + this.path + "script.sh " + this.path + this.folder + " && chmod 777 " + this.path + this.folder;
  exec(cmd, function(error) {
    if (error) {
      console.log(error);
    } else {
      fs.writeFile(sandbox.path + sandbox.folder + "/" + sandbox.filename, sandbox.code, function(error) {
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
  let counter = 0;
  const sandbox = this;

  const cmd = 'sh ' + this.path + 'run.sh ' + this.timeout_value + 's -v ' + this.path + this.folder + ':/usercode kishikawakatsumi/swift-power-assert' + ' sh /usercode/script.sh';
  exec(cmd);

  const intid = setInterval(function() {
    counter = counter + 1;
    fs.readFile(sandbox.path + sandbox.folder + '/completed', 'utf8', function(error, data) {
      if (error && counter < sandbox.timeout_value) {
        return;
      } else if (counter < sandbox.timeout_value) {
        fs.readFile(sandbox.path + sandbox.folder + '/errors', 'utf8', function(error, errorlog) {
          if (!errorlog) {
            errorlog = ""
          }
          success(data, errorlog);
        });
      } else {
        fs.readFile(sandbox.path + sandbox.folder + '/errors', 'utf8', function(error, errorlog) {
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

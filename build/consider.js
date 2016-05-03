var coalescePermissions, compileClaim, considerPermissions, considerSubject, isPermitted;

considerSubject = function(subject) {
  var permissions;
  permissions = [];
  if (subject && subject.permissions) {
    permissions = subject.permissions;
  }
  return considerPermissions(permissions);
};

considerPermissions = function() {
  var claim;
  claim = compileClaim.apply(null, arguments);
  Object.defineProperty(claim, "isPermitted", {
    value: isPermitted
  });
  return claim;
};

coalescePermissions = function() {
  var i, permissions;
  permissions = [];
  i = void 0;
  i = 0;
  while (i < arguments.length) {
    permissions = permissions.concat(arguments[i]);
    i++;
  }
  return permissions;
};

isPermitted = function() {
  var i, permissions;
  permissions = coalescePermissions.apply(null, arguments);
  if (permissions.length === 0) {
    return false;
  }
  i = 0;
  while (i < permissions.length) {
    if (!this.test(permissions[i])) {
      return false;
    }
    i++;
  }
  return true;
};

compileClaim = function() {
  var compilePart, compilePermission, i, permissions, result, statements;
  compilePermission = function(permission) {
    return permission.split(":").map(function(part) {
      var list;
      list = part.split(",").map(function(part) {
        return compilePart(part);
      });
      switch (list.length) {
        case 0:
          return "";
        case 1:
          return list[0];
        default:
          return "(" + list.join("|") + ")";
      }
    }).join(":");
  };
  compilePart = function(part) {
    var c, exp, i, special;
    special = "\\^$*+?.()|{}[]";
    exp = [];
    i = 0;
    while (i < part.length) {
      c = part.charAt(i);
      if (c === "?") {
        exp.push("[^:]");
      } else if (c === "*") {
        exp.push("[^:]*");
      } else {
        if (special.indexOf(c) >= 0) {
          exp.push("\\");
        }
        exp.push(c);
      }
      ++i;
    }
    return exp.join("");
  };
  permissions = coalescePermissions.apply(null, arguments);
  if (permissions.length === 0) {
    return new RegExp("$false^");
  }
  statements = [];
  i = 0;
  while (i < permissions.length) {
    statements.push(compilePermission(permissions[i]));
    i++;
  }
  result = statements.join("|");
  if (statements.length > 1) {
    result = "(" + result + ")";
  }
  return new RegExp("^" + result + "$");
};

module.exports = {
  considerSubject: considerSubject,
  considerPermissions: considerPermissions
};

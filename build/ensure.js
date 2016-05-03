var ACL, EnsureRequest, JSONAdapter, Permission, Subject, consider, _,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

consider = require("./consider");

ACL = require("./acl");

Permission = require("./permissions");

Subject = require("./subject");

_ = require("underscore");

JSONAdapter = require("./adapters/json");

EnsureRequest = (function() {
  function EnsureRequest(options) {
    this.loadSubjectPermissions = __bind(this.loadSubjectPermissions, this);
    this.isAuthorized = __bind(this.isAuthorized, this);
    this.isPermitted = __bind(this.isPermitted, this);
    this.onDenied = __bind(this.onDenied, this);
    this.redirectTo = __bind(this.redirectTo, this);
    this.withPermissions = __bind(this.withPermissions, this);
    this.withSubject = __bind(this.withSubject, this);
    this.use = __bind(this.use, this);
    this.initialize = __bind(this.initialize, this);
    options = options || {};
    this._adapters = {};
    this.options = {
      withSubject: options.withSubject,
      withPermissions: options.withPermissions,
      redirectTo: options.returnTo || "/login",
      onDenied: options.onDenied
    };
  }

  EnsureRequest.prototype.initialize = function(options) {
    _.extend(this.options, options);
    return (function(_this) {
      return function(req, res, next) {
        req.authorization = _this;
        return next();
      };
    })(this);
  };

  EnsureRequest.prototype.use = function(name, adapter) {
    if (adapter == null) {
      adapter = name;
      name = adapter.name;
    }
    if (!name) {
      throw new Error('Authorization adapter must have a name');
    }
    this._adapters[name] = adapter;
    return this;
  };

  EnsureRequest.prototype.withSubject = function(getSubject) {
    this.options.withSubject = getSubject;
    return this;
  };

  EnsureRequest.prototype.withPermissions = function(getPermissions) {
    this.withPermissions = getPermissions;
    return this;
  };

  EnsureRequest.prototype.redirectTo = function(url) {
    this.options.redirectTo = url;
    return this;
  };

  EnsureRequest.prototype.onDenied = function(deny) {
    this.options.onDenied = deny;
    return this;
  };

  EnsureRequest.prototype.isPermitted = function() {
    var arguments_, considerFunction, isPermittedCheck, onDenied, onDeniedDefault, onDeniedFunction, permissions, redirectTo, withFunction, withFunctionCandidate, withPermissions, withPermissionsDefault, withSubject;
    arguments_ = arguments;
    withPermissionsDefault = function(req, res) {
      if (req.user && req.user.permissions) {
        return req.user.permissions;
      }
      if (req.session && req.session.user && req.session.user.permissions) {
        return req.session.user.permissions;
      }
      if (req.permissions) {
        return req.permissions;
      }
      return [];
    };
    onDeniedDefault = function(req, res, next) {
      return res.redirect(redirectTo);
    };
    withSubject = this.options.withSubject;
    withPermissions = this.options.withPermissions;
    redirectTo = this.options.redirectTo;
    onDenied = this.options.onDenied;
    isPermittedCheck = void 0;
    if (arguments_.length === 1 && typeof arguments_[0] === "function") {
      isPermittedCheck = arguments_[0];
    } else {
      permissions = arguments_;
      isPermittedCheck = function(claim) {
        return claim.isPermitted.apply(claim, permissions);
      };
    }
    considerFunction = (withSubject ? consider.considerSubject : consider.considerPermissions);
    withFunctionCandidate = (withSubject ? withSubject : withPermissions || withPermissionsDefault);
    withFunction = withFunctionCandidate;
    if (withFunction.length !== 3) {
      withFunction = function(req, res, done) {
        return done(withFunctionCandidate(req, res));
      };
    }
    onDeniedFunction = onDenied || onDeniedDefault;
    return function(req, res, next) {
      return withFunction(req, res, function(permissionsOrSubject) {
        if (isPermittedCheck(considerFunction(permissionsOrSubject))) {
          if (!req.authorization) {
            req.authorization = this;
          }
          req.permission = permissionsOrSubject;
          return next();
        } else {
          return onDeniedFunction(req, res, next);
        }
      });
    };
  };

  EnsureRequest.prototype.isAuthorized = function(permission, subject, resource, options, callback) {
    if (typeof options === "function" && callback === void 0) {
      callback = options;
      options = {};
    }
    return Permission.find(this, permission, (function(_this) {
      return function(err, res) {
        var acl;
        if (!res) {
          return callback(false);
        }
        acl = new ACL({
          subject: subject,
          resource: resource,
          options: options
        });
        return acl.validate(_this, res, function(result) {
          return callback(result);
        });
      };
    })(this));
  };

  EnsureRequest.prototype.loadSubjectPermissions = function(subject, options, callback) {
    if (typeof options === "function" && callback === void 0) {
      callback = options;
      options = {};
    }
    subject = new Subject({
      subject: subject,
      options: options
    });
    return subject.permissions(this, (function(_this) {
      return function(result) {
        if (typeof callback === "function") {
          return callback(result);
        }
      };
    })(this));
  };

  return EnsureRequest;

})();

module.exports = module.exports = new EnsureRequest();

module.exports.EnsureRequest = EnsureRequest;

var ACL, Subject, subjects_obj, _,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

subjects_obj = {
  "subject_a": {
    acls: ["is_admin"],
    permissions: ["*:*"]
  },
  "subject_b": {
    acls: ["is_user"],
    permissions: ['User:read', 'User:create', 'User:update']
  },
  "subject_c": {
    acls: {
      '$or': ["is_admin", "is_user"]
    },
    permissions: ['Settings:*']
  }
};

_ = require("underscore");

ACL = require("./acl");

Subject = (function(_super) {
  __extends(Subject, _super);

  function Subject() {
    this._getFromAdapters = __bind(this._getFromAdapters, this);
    this._concatenatePermissions = __bind(this._concatenatePermissions, this);
    this.validate = __bind(this.validate, this);
    this.permissions = __bind(this.permissions, this);
    this.initiliaze = __bind(this.initiliaze, this);
    return Subject.__super__.constructor.apply(this, arguments);
  }

  Subject.prototype.initiliaze = function(options) {
    Subject.__super__.initiliaze.apply(this, arguments);
    return this.resource = {};
  };

  Subject.prototype.permissions = function(ensure, callback) {
    this.ensure = ensure;
    return this.validate(ensure, this.subject, (function(_this) {
      return function(result) {
        return callback(result);
      };
    })(this));
  };

  Subject.prototype.validate = function(ensure, sub, callback) {
    var res, result, subject_acl, subject_match, subject_name, value, _ref;
    this.ensure = ensure;
    subject_match = [];
    _ref = this._getFromAdapters();
    for (subject_name in _ref) {
      value = _ref[subject_name];
      subject_acl = false;
      if (value.acls != null) {
        subject_acl = this._validate(value.acls);
      }
      if (!subject_acl) {
        continue;
      }
      res = {
        subject: subject_name,
        permissions: value.permissions
      };
      subject_match.push(res);
    }
    result = {
      match: _.pluck(subject_match, 'subject'),
      permissions: this._concatenatePermissions(_.pluck(subject_match, 'permissions'))
    };
    result.compiled = new RegExp("(" + (result.permissions.join('|')) + ")");
    return callback(result);
  };

  Subject.prototype._concatenatePermissions = function(permissions) {
    var perms, result, temp, _i, _len;
    result = [];
    for (_i = 0, _len = permissions.length; _i < _len; _i++) {
      perms = permissions[_i];
      if (perms instanceof Array) {
        temp = result.concat(perms);
        result = temp;
      } else {
        result.push(perms);
      }
    }
    return result;
  };

  Subject.prototype._getFromAdapters = function(subject) {
    var adapter, name, subjects, _ref;
    _ref = this.ensure._adapters;
    for (name in _ref) {
      adapter = _ref[name];
      subjects = adapter.findSubject(subject);
      if (subjects != null) {
        return subjects;
      }
    }
  };

  return Subject;

})(ACL);

module.exports = Subject;

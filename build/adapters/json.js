var Adapter, JSONAdapter,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Adapter = require("null-authorization-adapter");

JSONAdapter = (function(_super) {
  __extends(JSONAdapter, _super);

  function JSONAdapter() {
    this.findACL = __bind(this.findACL, this);
    this.findPermission = __bind(this.findPermission, this);
    this.findResource = __bind(this.findResource, this);
    this.findSubject = __bind(this.findSubject, this);
    this.loadACLs = __bind(this.loadACLs, this);
    this.loadPermissions = __bind(this.loadPermissions, this);
    this.loadResources = __bind(this.loadResources, this);
    this.loadSubjects = __bind(this.loadSubjects, this);
    this.initialize = __bind(this.initialize, this);
    return JSONAdapter.__super__.constructor.apply(this, arguments);
  }

  JSONAdapter.prototype.name = "json";

  JSONAdapter.prototype.initialize = function(options) {
    this.options = options;
    this._subjects = options.subjects;
    this._resources = options.resources;
    this._permissions = options.permissions;
    return this._acls = options.acls;
  };

  JSONAdapter.prototype.loadSubjects = function(subjects) {
    this._subjects = subjects;
    return this;
  };

  JSONAdapter.prototype.loadResources = function(resources) {
    this._resource = resources;
    return this;
  };

  JSONAdapter.prototype.loadPermissions = function(permissions) {
    this._permissions = permissions;
    return this;
  };

  JSONAdapter.prototype.loadACLs = function(acls) {
    this._acls = acls;
    return this;
  };

  JSONAdapter.prototype.findSubject = function(name) {
    if (name) {
      return this._subjects[name];
    }
    return this._subjects;
  };

  JSONAdapter.prototype.findResource = function(name) {
    return this._resource[name];
  };

  JSONAdapter.prototype.findPermission = function(permission) {
    return this._permissions[permission];
  };

  JSONAdapter.prototype.findACL = function(acl) {
    return this._acls[acl];
  };

  return JSONAdapter;

})(Adapter);

module.exports = JSONAdapter;

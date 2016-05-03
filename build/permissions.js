var Permisssion, permissions,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

permissions = {
  "User:read": [
    {
      access: "all",
      allow: {
        "$or": ["is_admin", "is_owner"]
      },
      deny: "user_deny"
    }, {
      access: "email username",
      allow: {
        "$or": ["is_auth"]
      },
      deny: "is_anonimous"
    }, {
      access: "-password",
      allow: ["is_user"],
      deny: "is_anonimous"
    }
  ]
};

Permisssion = (function() {
  function Permisssion() {
    this._getFromAdapters = __bind(this._getFromAdapters, this);
    this.find = __bind(this.find, this);
  }

  Permisssion.prototype.find = function(ensure, perm, cb) {
    var policy;
    this.ensure = ensure;
    policy = this._getFromAdapters(perm);
    if (policy != null) {
      return cb(null, policy);
    }
    return cb(null, false);
  };

  Permisssion.prototype._getFromAdapters = function(perm) {
    var adapter, name, permission, _ref;
    _ref = this.ensure._adapters;
    for (name in _ref) {
      adapter = _ref[name];
      permission = adapter.findPermission(perm);
      if (permission != null) {
        return permission;
      }
    }
  };

  return Permisssion;

})();

module.exports = new Permisssion();

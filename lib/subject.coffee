subjects_obj =
  "subject_a":
    acls: ["is_admin"]
    permissions: ["*:*"]

  "subject_b":
    acls: ["is_user"]
    permissions: ['User:read', 'User:create', 'User:update']

  "subject_c":
    acls:
      '$or': ["is_admin", "is_user"]
    permissions: ['Settings:*']

_ = require "underscore"
ACL = require "./acl"

class Subject extends ACL
  initiliaze: (options) =>
    super
    @resource = {}

  permissions: (ensure, callback) =>
    @ensure = ensure
    @validate(ensure, @subject, (result) =>
      callback(result)
    )

  validate: (ensure, sub, callback) =>
    @ensure = ensure
    subject_match = []
    for subject_name, value of @_getFromAdapters()
      subject_acl = false
      subject_acl = @_validate(value.acls) if value.acls?
      continue unless subject_acl

      res = {
        subject: subject_name
        permissions: value.permissions
      }

      subject_match.push res

    result = {
      match: _.pluck subject_match, 'subject'
      permissions: @_concatenatePermissions _.pluck(subject_match, 'permissions')
    }
    result.compiled = new RegExp("(#{result.permissions.join('|')})")
    #console.log  "RESULT: ", result
    return callback(result)

  _concatenatePermissions: (permissions) =>
    result = []
    for perms in permissions
      if (perms instanceof Array)
        temp = result.concat(perms)
        result = temp
      else
        result.push perms

    return result

  _getFromAdapters: (subject) =>
    #return subjects_obj
    for name, adapter of @ensure._adapters
      subjects = adapter.findSubject(subject)
      if subjects?
        return subjects

  # _validate: (acls) =>
  #   return true

module.exports = Subject

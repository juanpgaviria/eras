
considerSubject = (subject) ->
  permissions = []
  permissions = subject.permissions  if subject and subject.permissions
  considerPermissions permissions

considerPermissions = -> # permission ... or [permission, ....]
  claim = compileClaim.apply(null, arguments)
  Object.defineProperty claim, "isPermitted",
    value: isPermitted

  claim

coalescePermissions = -> # permission ... or [permission, ...]
  permissions = []
  i = undefined
  i = 0
  while i < arguments.length
    permissions = permissions.concat(arguments[i])
    i++
  permissions

isPermitted = -> # permission ... or [permission, ...]
  permissions = coalescePermissions.apply(null, arguments)
  return false  if permissions.length is 0
  i = 0

  while i < permissions.length
    return false  unless @test(permissions[i])
    i++
  true

compileClaim = -> # permission ... or [permission, ....]
  compilePermission = (permission) ->
    permission.split(":").map((part) ->
      list = part.split(",").map((part) ->
        compilePart part
      )
      switch list.length
        when 0
          ""
        when 1
          list[0]
        else
          "(" + list.join("|") + ")"
    ).join ":"
  compilePart = (part) ->
    special = "\\^$*+?.()|{}[]"
    exp = []
    i = 0

    while i < part.length
      c = part.charAt(i)
      if c is "?"
        exp.push "[^:]"
      else if c is "*"
        exp.push "[^:]*"
      else
        exp.push "\\"  if special.indexOf(c) >= 0
        exp.push c
      ++i
    exp.join ""

  permissions = coalescePermissions.apply(null, arguments)
  return new RegExp("$false^")  if permissions.length is 0
  statements = []
  i = 0

  while i < permissions.length
    statements.push compilePermission(permissions[i])
    i++
  result = statements.join("|")
  result = "(" + result + ")"  if statements.length > 1
  new RegExp("^" + result + "$")

module.exports =
  considerSubject: considerSubject
  considerPermissions: considerPermissions

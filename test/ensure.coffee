assert = require("assert")
authorization = require("../")
describe "ensureRequest", ->
  httpContextMock = (result, done) ->
    self = this
    @done = done
    @result = result
    result.redirectedTo = undefined
    result.nextCalled = false
    @req = session:
      user:
        permissions: ["identity:view", "session:*", "system:list,view,edit", "version:v2??"]

    @res = redirect: (url) ->
      self.result.redirectedTo = url
      self.done()  if self.done

    @next = ->
      self.result.nextCalled = true
      self.done()  if self.done

  checkMiddleware = (middleware, result, done, check) ->
    httpContext = new httpContextMock(result, ->
      try
        check result
        done()
      catch e
        done e
    )
    middleware httpContext.req, httpContext.res, httpContext.next
  checkPermitted = (result) ->
    assert.equal result.redirectedTo, undefined
    assert.equal result.nextCalled, true
  checkDenied = (result) ->
    assert.equal result.redirectedTo, "/login"
    assert.equal result.nextCalled, false
  checkRedirectedElsewhere = (result) ->
    assert.equal result.redirectedTo, "/elsewhere"
    assert.equal result.nextCalled, false

  it "permitted", (done) ->
    result = {}
    middleware = authorization.isPermitted("identity:view")
    checkMiddleware middleware, result, done, checkPermitted

  it "permitted asserting multiple permissions", (done) ->
    result = {}
    middleware = authorization.isPermitted("identity:view", "system:list")
    checkMiddleware middleware, result, done, checkPermitted

  it "denied", (done) ->
    result = {}
    middleware = authorization.isPermitted("identity:edit")
    checkMiddleware middleware, result, done, checkDenied

  it "denied asserting multiple permissions", (done) ->
    result = {}
    middleware = authorization.isPermitted(["identity:view", "system:reboot"])
    checkMiddleware middleware, result, done, checkDenied

  it "denied redirectTo", (done) ->
    result = {}
    middleware = authorization.redirectTo("/elsewhere").isPermitted("identity:edit")
    checkMiddleware middleware, result, done, checkRedirectedElsewhere

  it "or custom permission check - permitted", (done) ->
    result = {}
    middleware = authorization.isPermitted((claim) ->
      claim.isPermitted("identity:edit") or claim.isPermitted("identity:view")
    )
    checkMiddleware middleware, result, done, checkPermitted

  it "and custom permission check - denied", (done) ->
    result = {}
    middleware = authorization.isPermitted((claim) ->
      claim.isPermitted("identity:edit") and claim.isPermitted("identity:view")
    )
    checkMiddleware middleware, result, done, checkDenied

  it "denied handler", (done) ->
    result = {}
    middleware = authorization.onDenied((req, res, next) ->
      result.onDeniedCalled = true
      res.redirect "/elsewhere"
    ).isPermitted("identity:edit")
    checkMiddleware middleware, result, done, ->
      assert.equal result.onDeniedCalled, true
      checkRedirectedElsewhere result


  it "custom considerPermissions", (done) ->
    result = {}
    middleware = authorization.withPermissions((req, res) ->
      result.withPermissionsCalled = true
      ["identity:*"]
    ).isPermitted("identity:edit")
    checkMiddleware middleware, result, done, ->
      assert.equal result.withPermissionsCalled, true
      checkPermitted result


  it "custom asynchronous considerPermissions", (done) ->
    result = {}
    middleware = authorization.withPermissions((req, res, done) ->
      result.withPermissionsCalled = true
      done ["identity:*"]
    ).isPermitted("identity:edit")
    checkMiddleware middleware, result, done, ->
      assert.equal result.withPermissionsCalled, true
      checkPermitted result


  it "custom considerSubject", (done) ->
    result = {}
    middleware = authorization.withSubject((req, res) ->
      result.withPermissionsCalled = true
      user =
        username: "administrator"
        permissions: "*:*"

      user
    ).isPermitted("identity:edit")
    checkMiddleware middleware, result, done, ->
      assert.equal result.withPermissionsCalled, true
      checkPermitted result


  it "custom asynchronous considerSubject", (done) ->
    result = {}
    middleware = authorization.withSubject((req, res, done) ->
      result.withPermissionsCalled = true
      user =
        username: "administrator"
        permissions: "*:*"

      done user
    ).isPermitted("identity:edit")
    checkMiddleware middleware, result, done, ->
      assert.equal result.withPermissionsCalled, true
      checkPermitted result


  it "permitted new EnsureRequest", (done) ->
    result = {}
    ensureRequest = new authorization()
    middleware = ensureRequest.isPermitted("identity:view")
    checkMiddleware middleware, result, done, checkPermitted

  it "custom options", (done) ->
    result = {}

    # Global default options can be set on authorization.options
    ensureRequest = new authorization()
    ensureRequest.options.redirectTo = "/elsewhere"
    middleware = ensureRequest.isPermitted("identity:edit")
    checkMiddleware middleware, result, done, checkRedirectedElsewhere

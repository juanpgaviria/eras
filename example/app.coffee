###
Module dependencies.
###
express = require("express")
http = require("http")
path = require("path")
authorization = require("./authorization")
app = express()

# all environments
app.set "port", process.env.PORT or 3000
app.set "views", path.join(__dirname, "views")
app.set "view engine", "ejs"
app.use express.favicon()
app.use express.logger("dev")
app.use express.json()
app.use express.urlencoded()
app.use express.methodOverride()
app.use express.cookieParser("your secret here")
app.use express.session()

# authorization
app.use authorization.initialize()

app.use app.router
app.use express.static(path.join(__dirname, "public"))

# development only
app.use express.errorHandler()  if "development" is app.get("env")




# setup permission middleware
ensureNounVerb = authorization.isPermitted("noun:verb")


# Define Routes
app.get "/", (req, res) ->
  res.render "home",
    authenticated: (if req.session.user then true else false)


app.get "/login", (req, res) ->
  subject = {
    _id: 1
    is_admin: true
  }
  resource = {
    _id: 1
  }
  req.authorization.isAuthorized("User:read", subject, resource, {}, (result) ->
    console.log result
    res.render "login", {}
  )


app.post "/login", (req, res) ->
  user =
    username: "root"
    _id: 1
    is_admin: true

  req.authorization.loadSubjectPermissions(user, (result) ->
    req.session.user = user
    req.session.user.permissions = result.permissions
    console.log "MATCH: ", result
    console.log "USER: ", req.session.user
    res.redirect "/"
  )

app.get "/logout", (req, res) ->
  req.session.destroy()
  res.redirect "/"

app.get "/assert", ensureNounVerb, (req, res) ->
  subject = {
    _id: 1
    is_admin: true
  }
  resource = {
    _id: 1
  }
  req.authorization.isAuthorized("User:read", subject, resource, {}, (result) ->
    console.log "USER: ", req.permission, result.permissions
    res.render "assert", {}
  )


# Start Server
http.createServer(app).listen app.get("port"), ->
  console.log "Express server listening on port " + app.get("port")

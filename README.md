NOTE: This project extends the features of
https://www.npmjs.com/package/express-authorization

# ERA

Explicit role authorization, to better understanding:
https://stormpath.com/blog/new-rbac-resource-based-access-control/

# How it works

ERA, its a non-intrusive* authorization system. Its works with a set of rules
that are defined by 3 types of objects:
  * Subjects
  * Resources
  * Actions

Those 3 objects are glue together with Permissions and ACLs. ERA load those rules using different
kind of adapters(so far there its JSON adapter but mongo, mysql, postgres, etc
adapter can be created, checkout: https://github.com/juanpgaviria/era-adapter).

* need only to right few lines in your code.

## Subjects

Are defined to load permissions. Using the JSON adapter would something like:

```js
subjects =
  "subject_a":
    acls: ["is_admin"]
    permissions: ["*:*"]

  "subject_b":
    acls: ["is_provider"]
    permissions: ['User:read', 'User:create', 'User:update']

  "subject_c":
    acls:
      '$or': ["is_admin", "is_user"]
    permissions: ['Settings:*']
```

A user can match multiple subjects. Which means that she has more perms
everything depends of which ACL are true.

## Resources and Actions == Permission

Resource/Action by them selfs are just a names, but when there are mixed together
became a permission:

```
Resource:Action
```

for example:
```
'User:read', 'User:create', 'User:update'
```

## ACLs

ACL are true/false statements use to:
  * Get subjects match
  * Grant or deny access to Subject when its trying requesting an action to
  a resource

ACL has access to `subject` and `resource` when its been evaluated.

For example:

```js
acls =
  "is_admin": "subject.is_admin == true"
  "is_owner": "subject._id == resource._id"
  "is_user": "subject._id != undefined"
  "user_deny": "subject._id != resource._id"
  "is_auth": "subject._id != undefined"
  "is_provider": "subject.is_provider == true"
```


# Authorization

Web apps are build base on layers, and for every layer should be a an
authorization check. For example the firewall would be the first authorization
checkpoint, then http server, the app url handler, controller, data model access.

## firewalls

Those usually check IPs, throttling, etc

## http server or load balancers

Throttling, etc

## App url handler

Its usually has middleware to check its user is/isnot authenticated, and if the
request satisfy the validation (authentication) normally delegate the authorization
to the controller.

For example:
Lets say that we have and app with 2 kind(call roles) of users:
URL:
  * /public/url: public to world
  * /customer/url: customer and admin only
  * /admin/url: admin only

Usually the validation at this layer(APP URL handler) will check if the user
is/is't authenticated like(using passport):

```js
var express = require('express');
var pasport = require('express');
var app = express();

app.get('/customer/url',
        passport.authenticate('basic', { session: false }),
        function(req, res, next) {
          // controller
          ...
        }
);
```

That delegate the authorization to the controller if the user is/is not admin,
later will see the implications(you may already know). But why a customer that
navigate to `/admin/url` will pass this layer? if we already know that she can't.

ERA can do that kind of validation(will explain later how to do it very simple:

```js
var express = require('express');
var passport = require('express');
var era = require('eras');
var app = express();

// Consider an authenticated user in the express session:
// req.session.user.permissions = ["restricted:*"]

app.get('/customer/url',
        passport.authenticate('basic', { session: false }),
        era.ensureRequest.isPermitted("restricted:view"),
        function(req, res, next) {
  // controller
    ...
});
```

Its just add an extra middleware and this layer can 403 reply or let request
pass through.   


## Controller

This layer its the one that check authorization, and i have seen several
authorization strategies at this layer from a lot of IF checking conditions role
or checking model:perms which usualy are tie to fixed conditions which its fine
if your application roles/perms wont change or its small app or have few kind of
users.  

Check authorization on differnet APP layers:


Can we use with connect/express middleware
An express/connect middleware module for enforcing an Apache Shiro inspired authorization system.

```js
var express = require('express');
var authorization = require('express-authorization');
var app = express();

// Consider an authenticated user in the express session:
// req.session.user.permissions = ["restricted:*"]

app.get('/restricted',
  authorization.ensureRequest.isPermitted("restricted:view"),
  function(req, res) {
    ...
  });
```

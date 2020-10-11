const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  // Gather the jwt access token from the request header
  const authHeader = req.headers['authorization']
  // const token = authHeader.split(' ')[1] || authHeader
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.status(401).send({
    auth: false,
    error: "Unauthorized"
  }) // if there isn't any token
  jwt.verify(token, process.env.PRIVATE_KEY, (err, user) => {
    // console.log(err)
    if (err) return res.sendStatus(403)
    req.user = user
    next() // pass the execution off to whatever request the client intended
  })
}

function authenticateTokenAdmin(req, res, next) {
  // Gather the jwt access token from the request header
  const authHeader = req.headers['authorization']
  // const token = authHeader && authHeader.split(' ')[1]
  const token = authHeader.split(' ')[1] || authHeader
  if (token == null) return res.status(401).send({
    auth: false,
    error: "Unauthorized"
  }) // if there isn't any token
  jwt.verify(token, process.env.PRIVATE_KEY, (err, user) => {
    // console.log(err)
    if (err) return res.sendStatus(403)
    if (user.isAdmin) {
      req.user = user
      next()
    } else {
      return res.sendStatus(403)
    }
  })
}

module.exports = { authenticateToken, authenticateTokenAdmin }

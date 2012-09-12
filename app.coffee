express = require 'express'

app = express.createServer()

app.use(express.logger(format: '[:date] [:response-time] [:status] [:method] [:url]'))
app.use(express.bodyParser()) # pre-parses JSON body responses
app.use(express.cookieParser()) # pre-parses JSON cookies
app.use(express.session(secret: 'DRAWN', store: store, cookie: { path: '/', httpOnly: true, maxAge: 604800 })) # keep cookie for one week
app.use(express.compiler(src: "#{__dirname}/src", dest: "#{__dirname}/public", enable: ['coffeescript','sass'])) # looks for cs files to render as js
app.use(express.static("#{__dirname}/public"))


# start application 
app.listen(port = 8002)
console.log("listening on :#{port}")

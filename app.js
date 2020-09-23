// Import all libraries
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const { ApolloServer } = require('apollo-server-express');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const errorhandler = require('errorhandler');
const cors = require('cors');

// Import router
const router = require('./routes');

// Initialize MongoDB and Firebase Admin SDK
require('./config/mongoose');
require('./config/firebase');

// Initialise Express Server and define server port
const app = express();
const PORT = process.env.PORT || 8080;

// Setup Cross-Origin Resource Sharing for the development environment
//TODO: replace <Your-Website-Link>
var corsOptions = {
  origin:
    !process.env.NODE_ENV || process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : '<Your-Website-Link>',
};
app.use(cors(corsOptions));

// Use Cookie Parse, JSON and Encoded URL Body Parser, and CSURF in Express
app.use(cookieParser());
app.use(csrf({ cookie: true }));

// Use Error Handler in development environment
if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
  app.use(errorhandler());
}

// Use Express Session (w/ MongoDB Store in Production)
if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
  //TODO: replace <Project-Name>
  app.use(
    session({
      secret: '<Project-Name>-development-secret',
      key: '<Project-Name>-development-key',
      resave: false,
      saveUninitialized: true,
    })
  );
} else {
  //TODO: replace <MDB-User-Name>, <MDB-Password>, <MDB-Address>, <MDB-DB-Name>, <MDB-User-Auth-Database>
  const store = new MongoDBStore({
    uri:
      process.env.MONGO_SESSION_URL ||
      //Development Server Address
      'mongodb://<MDB-User-Name>:<MDB-Password>@<MDB-Address>:<MDB Port | 27017>/<MDB-DB-Name>?authSource=<MDB-User-Auth-Database>&retryWrites=true&w=majority',
    collection: 'sessionCacheStore',
    expires: 1000 * 60 * 60 * 24 * 5,
    connectionOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      poolSize: 100,
      serverSelectionTimeoutMS: 10000,
    },
  });
  store.on('error', function (error) {
    console.error(new Error(`<Project-Name> Server | App | Error on Session Store`), error);
  });
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      key: process.env.SESSION_KEY,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 1,
      },
      store: store,
      resave: true,
      saveUninitialized: true,
    })
  );
}

// Initialise the Apollo Server
const apolloServer = new ApolloServer({
  // Either use auto-generated schema from typeDefs+resolvers or use your own custom schema from schema
  // typeDefs: require('./gql/types'),
  // resolvers: require('./gql/resolvers'),
  schema: require('./gql/schema'),
  context: ({ req, res }) => ({
    authToken: req.headers.authorization,
    csrfToken: req.csrfToken(),
    authScope: true, //TODO: function to check and append auth scopes from req.headers.authrorization
  }),
  cors: corsOptions,
  playground: !process.env.NODE_ENV || process.env.NODE_ENV !== 'production',
  debug: !process.env.NODE_ENV || process.env.NODE_ENV !== 'production',
});

// Attach Express Server with Apollo Server
apolloServer.applyMiddleware({ app, path: '/v1/graph', cors: corsOptions });

// Attach Express Router
app.use(router);

//TODO: replace <Project-Name>
// Start Express Server on defined port
app.listen(PORT, function (err) {
  if (err) {
    console.error(new Error(`<Project-Name> Server | App | Express Server Error on Port ${PORT}`), err);
  }
  console.info(`<Project-Name> Server | App | Express Server Started on Port ${PORT}`);
});

module.exports = app;

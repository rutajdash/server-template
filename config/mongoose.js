const mongoose = require('mongoose');

let options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  poolSize: 100,
  useFindAndModify: false,
};
//TODO: replace <MDB-User-Name>, <MDB-Password>, <MDB-Address>, <MDB-DB-Name>, <MDB-User-Auth-Database>
mongoose.connect(
  process.env.MONGO_APP_URL ||
    //Development Server Address
    'mongodb://<MDB-User-Name>:<MDB-Password>@<MDB-Address>:<MDB Port | 27017>/<MDB-DB-Name>?authSource=<MDB-User-Auth-Database>&retryWrites=true&w=majority',
  options
);
mongoose.set('autoIndex', false);

const db = mongoose.connection;

db.on('error', (err) => {
  console.error(new Error('<Project-Name> Server | MongoDB | Could not connect to database'), err);
});
db.once('open', (data) => {
  console.info('<Project-Name> Server | MongoDB | Database Connected', data);
});

module.exports = {
  db,
  mongoose,
};

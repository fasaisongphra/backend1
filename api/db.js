// const port = 7000;
const knex = require("knex")({
    client: "mysql",
    connection: {
      host: "localhost",
      port: 3306,
      user: "root",
      password: "",
      database: "stdactivity_2567",
    },
  });
  
  module.exports = knex
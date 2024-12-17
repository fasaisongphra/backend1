module.exports = {
    server: {
      port: 7000,
    },
  
    db: {
      client: 'mysql',
      connection: {
        host: "localhost",
          port: 3306,
          user: "root",
          password: "",
          database: "stdactivity_2567",
      },
    },
    jwt: {
      secret: '123456',
      options: {
        algorithm: 'HS256',
        expiresIn: 3600000,
      },
    },
  }
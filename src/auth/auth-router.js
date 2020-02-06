const express = require('express')
const AuthService = require('./auth-service')
const path = require('path')
const authRouter = express.Router()

const serializeUser = user => {
  const { id, username, email, date_created } = user;
  return { id, username, email, date_created };
}

authRouter
  .post('/login', (req, res, next) => {
    const knex = req.app.get('db');

    const { username, password } = req.body;
    const user = { username, password };

    for (const [key, value] of Object.entries(user)) {
      if (value === null) {
        return res.status(400).json({
          error: `Missing ${key} in request body`
        })
      }
    }

    let dbUser;
    AuthService.getUserByUserName(knex, username)
      .then(dbUser => {
        if (!dbUser) {
          return res.status(400).json({
            error: `Username does not exist`
          })
        }

        AuthService.comparePasswords(user.password, dbUser.password)
          .then(passwordsMatch => {
            console.log(passwordsMatch)
            if (!passwordsMatch) {
              return res.status(400).json({
                error: `Password incorrect`
              })
            }

            res
              .status(201)
              .json({
                user: serializeUser(dbUser),
                authToken: AuthService.createJWT(dbUser.username, {user_id: dbUser.id})
            })
          })
          .catch(next)
      })
      .catch(next)
  })

  module.exports = authRouter;

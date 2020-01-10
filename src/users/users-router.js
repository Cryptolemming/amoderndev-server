const express = require('express')
const UsersService = require('./users-service')
const { requireAuth } = require('../middleware/jwt-auth')
const css = require('xss')
const AuthService = require('../auth/auth-service')
const path = require('path')

const usersRouter = express.Router()


const serializeUser = user => {
  const { id, username, email, date_created } = user;
  return { id, username, email, date_created };
}

usersRouter
  .route('/')
  .post((req, res, next) => {
    const knex = req.app.get('db')

    const { username, password, email } = req.body;

    for (const key of ['username', 'password', 'email']) {
      if(!req.body[key]) {
        return res.status(400).json({
          error: `Missing ${key} in request body`
        })
      }
    }

    AuthService.getUserByUserName(knex, username)
      .then(user => {
        if (user) {
          return res.status(400).json({
            error: `Username already taken`
          })
        }

        UsersService.hashPassword(password)
          .then(hashedPassword => {
            const user = {
              username,
              password: hashedPassword,
              email
            }
            return UsersService.insertUser(knex, user);
          })
          .then(user => {
            return res
              .status(201)
              .location(path.posix.join(req.originalUrl, `/${user.id}`))
              .json(serializeUser(user))
          })
          .catch(next)
        })
      .catch(next)

  })

  usersRouter
    .route('/:id')
    .get((req, res, next) => {
      const knex = req.app.get('db')

      UsersService.getUserById(knex, req.params.id)
        .then(user => {
          if(!user) {
            return res.status(404).json({
              error: `User not found`
            })
          }

          return res.json(serializeUser(user));
        })
    })

    module.exports = usersRouter;

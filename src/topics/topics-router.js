const express = require('express')
const xss = require('xss')
const path = require('path')
const TopicsService = require('../topics/topics-service')

const topicsRouter = express.Router()
const bodyParser = express.json()

const serializeTopic = topic => ({
  id: topic.id,
  title: xss(topic.title)
})

topicsRouter
  .route('/')
  .get(async (req, res, next) => {
    const knexInstance = req.app.get('db')

    try {
      const topics = await TopicsService.getTopics(knexInstance)
      res.json(topics.map(topic => serializeTopic(topic)))
    } catch(err) {
      return res.status(500).json({
        error: err
      })
    }
  })

module.exports = topicsRouter;

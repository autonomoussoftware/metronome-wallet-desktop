'use strict'

const topicToAddress = topic => `0x${topic.substr(-40)}`.toLowerCase()

module.exports = topicToAddress

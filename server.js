const express = require('express')
const cors = require('cors')
const fetch = require('node-fetch')
const Unsplash = require('unsplash-js').default
global.fetch = fetch

const unsplash = new Unsplash({
  applicationId: process.env.APPLICATION_ID,
  secret: process.env.APPLICATION_SECRET,
})

const app = express()
const port = process.env.PORT || 3000

app.listen(port)

const grabImages = async keyword => {
  const images = await (await (await unsplash.search.photos(
    keyword,
    1,
    12
  )).json()).results
  return images
}

const getHex = (r, g, b) =>
  `#${r.toString(16).length === 1 ? `0${r.toString(16)}` : r.toString(16)}${
    g.toString(16).length === 1 ? `0${g.toString(16)}` : g.toString(16)
  }${b.toString(16).length === 1 ? `0${b.toString(16)}` : b.toString(16)}`

const getRgb = hex => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

app.get('/search/:keyword', cors(), async (req, res) => {
  let images = await grabImages(req.params.keyword)
  const appendColor = async i => {
    const rgb = getRgb(i.color)
    return {
      ...i,
      color: {
        hex: i.color,
        rgb,
        dark: [rgb.r, rgb.g, rgb.b].filter(v => v > 200).length >= 2,
      },
    }
  }

  const response = {
    images: await Promise.all(images.map(appendColor)),
  }
  res.json(response)
})

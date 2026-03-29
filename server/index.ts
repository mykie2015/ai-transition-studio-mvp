import { buildServer } from './app.js'

const port = Number(process.env.PORT ?? 4174)
const app = buildServer()

app.listen(port, () => {
  console.log(`transition-studio-api listening on ${port}`)
})

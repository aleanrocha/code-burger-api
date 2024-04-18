import app from './app.js'

const port = process.env.PORT || 3001

app.listen(port, '0.0.0.0', () =>
  console.log(`🚀 Server started on port ${port}`),
)

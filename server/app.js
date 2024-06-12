import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import { checkAuth } from './middlewares/authMiddleware.js'

const app = express()
app.use(helmet())

import cors from 'cors'
app.use(
  cors({
    credentials: true,
    origin: true,
  }),
)

app.use(express.json())

import session from 'express-session'
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60, // 1 time
  },
})
app.use(sessionMiddleware)

app.use(checkAuth)

app.use((req, res, next) => {
  setTimeout(next, 500);
});


import customRouter from './routers/customRouter.js'
app.use(customRouter)

import authRouter from './routers/authRouter.js'
app.use(authRouter)

import usersRouter from './routers/usersRouter.js'
app.use(usersRouter)

import schoolsRouter from './routers/schoolsRouter.js'
app.use(schoolsRouter)

import locationsRouter from './routers/locationsRouter.js'
app.use(locationsRouter)

import coursesRouter from './routers/coursesRouter.js'
app.use(coursesRouter)

import bookingsRouter from './routers/bookingsRouter.js'
app.use(bookingsRouter)

import headerKeyRouter from './routers/headerKeyRouter.js'
app.use(headerKeyRouter)

import holidaysRouter from './routers/holidaysRouter.js'
app.use(holidaysRouter)

import classroomsRouter from './routers/classroomsRouter.js'
app.use(classroomsRouter)

const PORT = process.env.PORT || 8080
app.listen(PORT, error => {
  if (error) {
    console.log('Server failed to start', error)
    return
  }
  console.log('Server is running on port', PORT)
})

export default app

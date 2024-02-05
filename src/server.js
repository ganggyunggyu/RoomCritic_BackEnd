import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import path from 'path';

import dotenv from 'dotenv';
import dbConection from './db.js';

import authRouter from './routes/auth.js';
import postRouter from './routes/post.js';

dotenv.config();

const app = express();

app.listen(process.env.PORT_URL || 4000, () => {
  console.log(`${process.env.PORT_URL}번 포트에서 서버 열림!`);

  dbConection();
});

/**
 * 미들웨어
 * cors()
 * 모든 요청에 대한 cors 제거
 * express.json()
 * 요청의 데이터가 json일 경우 JavaScript로 변환해준다
 * req.body에 파싱된 JSON데이터가 저장되어 API 엔드포인트에서 사용할 수 있다
 */
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
    }),
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// 라우터
app.use('/auth', authRouter);
app.use('/post', postRouter);

// '/'에 접근할 경우 실행해줄 코드
// app.get('/', (req, res) => {
//   console.log('/ 접근');
//   console.log(req.cookies);
//   return res.status(200).json(req.cookies);
// });

import express, { request } from 'express';
import bcrypt from 'bcrypt';
import User from '../Models/UserModel.js';

import passport from 'passport';
import LocalStrategy from 'passport-local';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import axios from 'axios';

const router = express.Router();

router.post('/join', async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const emailCheck = await User.findOne({ email: req.body.email });
    const phoneNumberCheck = await User.findOne({
      phoneNumber: req.body.phoneNumber,
    });

    if (emailCheck) {
      return res.status(200).json({ message: '중복되는 이메일이 있습니다' });
    }
    if (phoneNumberCheck) {
      return res.status(200).json({ message: '중복되는 휴대폰 번호가 있습니다' });
    }
    const user = new User({
      email: req.body.email,
      password: hashPassword,
      displayName: req.body.displayName,
      phoneNumber: req.body.phoneNumber,
      roll: 'user',
      posts: 0,
    });
    await user.save();
    res.status(200).json({ message: '회원가입 성공' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: '회원가입 실패' });
  }
});

router.post('/emailcheck', async (req, res) => {
  console.log(req.body);
});

router.use(passport.initialize());
router.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email', // 이 부분을 'email'로 설정
      passwordField: 'password',
    },
    async (email, password, cb) => {
      try {
        const user = await User.findOne({ email: email });
        if (!user) {
          return cb(null, false, { message: '존재하지 않는 이메일 입니다.' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return cb(null, false, { message: '비밀번호를 확인해주세요.' });
        }
        return cb(null, user);
      } catch (err) {
        console.log(err);
        done(err, null);
      }
    },
  ),
);
passport.use(
  new KakaoStrategy(
    {
      clientID: 'cdcc92eb3fb9484fa8ae2ca6e1eb5f62',
      clientSecret: 'NnDtUyZE7gLMwYGiYlcsPnbWAOtQz4JO',
      callbackURL: 'http://localhost:3000/auth',
    },
    (accessToken, refreshToken, profile, done) => {
      // authorization 에 성공했을때의 액션
      console.log(`accessToken : ${accessToken}`);
      console.log(`사용자 profile: ${JSON.stringify(profile._json)}`);
      let user = {
        profile: profile._json,
        accessToken: accessToken,
      };
      return done(null, user);
    },
  ),
);
passport.serializeUser((user, done) => {
  process.nextTick(() => {
    done(null, {
      user,
    });
  });
});

passport.deserializeUser(async (user, done) => {
  process.nextTick(() => {
    done(null, user);
  });
});

router.post('/login', async (req, res, next) => {
  passport.authenticate('local', (error, user, info) => {
    if (error) return res.status(500).json(error);
    if (!user) return res.status(401).json(info.message);
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.status(200).json({ message: '로그인 성공', isLoggedIn: true, userInfo: user });
      console.log('good');
    });
  })(req, res, next);
});

router.get('/logout', async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    return res.clearCookie('connect.sid').status(200).json({ message: '로그아웃 성공' });
  });
});

router.get('/login/check', async (req, res) => {
  try {
    console.log('/login/check : ', req.user);
    if (!req.user) {
      return res.status(201).json({ message: '세션 만료' });
    }
    return res.status(200).json({
      message: '세션 있음',
      isLoggedIn: true,
      userInfo: { ...req.user },
    });
  } catch (err) {
    console.log(err);
  }
});
const getToken = async (req, res, next) => {
  // const requestData = {
  //   grant_type: 'authorization_code',
  //   client_id: 'cdcc92eb3fb9484fa8ae2ca6e1eb5f62',
  //   redirect_uri: 'http://localhost:3000/auth',
  //   code: req.body.authorizationCode,
  // };
  // const queryStringBody = Object.keys(requestData)
  //   .map((k) => encodeURIComponent(k) + '=' + encodeURI(requestData[k]))
  //   .join('&');
  const CLIENT_ID = 'cdcc92eb3fb9484fa8ae2ca6e1eb5f62';
  const REDIRECT_URL = 'http://localhost:3000/auth';
  const code = req.body.authorizationCode;
  const kakaoTokenUrl = `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL}&code=${code}`;
  const kakaoHeader = {
    'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
  };
  await axios
    .post(kakaoTokenUrl, {
      headers: kakaoHeader,
    })
    .then((res) => {
      console.log('getToken 성공 !');
      const kakaoToken = res.data;
      getUserInfo(kakaoToken);
      next();
    })
    .catch((err) => {
      console.log('err');
      console.log(err);
      next(err);
    });
};

const getUserInfo = async (token) => {
  console.log('getUserInfo 접근');
  console.log('getUserInfo TOKEN : ', token);
};

router.post('/kakao/login', getToken);

export default router;

import Koa, {Context, Next} from 'koa';
import Router from 'koa-router';
import KoaJson from 'koa-json';
import serve from 'koa-static';
import logger from 'koa-logger';
import bodyParser from 'koa-bodyparser';
import {DevicePasskey, LoginFinish, LoginRequest, RegisterFinish, RegisterRequest} from '../types';
import {
  convertAuthenticator,
  convertChallenge, getAuthenticatorData,
  getDeviceRegistrationInfo,
  getNewChallenge,
  getRegistrationInfo,
} from './utils';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  VerifiedRegistrationResponse,
  verifyAuthenticationResponse,
  verifyRegistrationResponse
} from '@simplewebauthn/server';
import {addUser, addUserCredential, getUserByEmail, updateUser, updateUserChallenge} from './db';

const SERVER_PORT = 3013;
const server = new Koa();
const router = new Router();
const rpID = 'localhost';
const rpName = 'webauth-app';
const expectedOrigin = 'http://localhost:3013';

router.get('/healthz', async (ctx: Context): Promise<void> => {
  ctx.body = {
    status: 'OK',
  }
});

router.post('/register/start', async (ctx: Context): Promise<void> => {
  const { user } = <RegisterRequest>ctx.request.body;

  const dbUser = await addUser(user);
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: dbUser._id.toString(),
    userName: dbUser.email,
    attestationType: 'none',
  });
  await updateUserChallenge(dbUser.email, options.challenge);

  ctx.body = {
    options,
    user: dbUser,
  };
});

router.post('/register/finish', async (ctx: Context, next: Next):Promise<void> => {
  const { userName , data } = <RegisterFinish>ctx.request.body;

  let verification: VerifiedRegistrationResponse;
  const user = await getUserByEmail(userName);
  try {
    verification = await verifyRegistrationResponse({
      response: data,
      expectedChallenge: user.challenge,
      expectedOrigin: expectedOrigin,
      expectedRPID: rpID,
      requireUserVerification: false,
    });
  } catch(err) {
    console.log('Error verifying registration response')
    console.log(err);
    ctx.status = 500;
    ctx.body = {
      error: 'Registration verification failed.',
    }
    await next();
  }
  if (verification) {
    const { verified, registrationInfo } = verification;
    if (verified) {
      const credential: DevicePasskey = getDeviceRegistrationInfo(registrationInfo, data.response.transports);
      await addUserCredential(userName, credential);
      ctx.body = {
        status: 'OK',
      }
      await next();
    }
  } else {
    ctx.status = 500;
    ctx.body = {
      error: 'Something went wrong',
    }
  }
});

router.post('/login/start', async (ctx: Context, next: Next):Promise<void> => {
  const { userName } = <LoginRequest>ctx.request.body;
  const user = await getUserByEmail(userName);
  if (!user) {
    ctx.status = 400;
    ctx.body = {
      error: 'Invalid User',
    }
    console.log('Invalid user!');
    ctx.app.emit('error', new Error('Invalid User'), ctx);
  } else {
    const options = await generateAuthenticationOptions({
      allowCredentials: user.credentials.map(convertAuthenticator),
      rpID,
      userVerification: 'required',
    })
    await updateUserChallenge(userName, options.challenge);
    ctx.body = options;
  }
});

router.post('/login/finish', async (ctx: Context):Promise<void> => {
  const { userName , data} = <LoginFinish>ctx.request.body;

  const user = await getUserByEmail(userName);
  // check if the user exists
  if (!user) {
    ctx.status = 400;
    ctx.body = {
      error: 'Invalid user',
    }
  } else {
    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        expectedChallenge: user.challenge,
        response: data,
        authenticator: getAuthenticatorData(user, data.rawId),
        expectedRPID: rpID,
        expectedOrigin,
      });
      const { verified } = verification;
      if (verified) {
        ctx.status = 200;
        ctx.body = {
          status: 'OK'
        }
      } else {
        ctx.status = 403;
        ctx.body = {
          status: 'Failed Auth'
        }
      }
    } catch(err) {
      console.log(err);
      ctx.status = 500;
      ctx.body = {
        error: 'Something bad happened',
      }
    }
  }

});

server.use(KoaJson());
server.use(bodyParser({
  jsonLimit: '5mb',
}));
server.use(logger());
server.use(router.routes());
server.use(router.allowedMethods());
server.use(serve('./dist/public'));

server.on('error', console.error);

server.listen(SERVER_PORT, () => {
  console.log(`Server listening on port ${SERVER_PORT}`);
});

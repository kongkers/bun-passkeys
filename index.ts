import { Context, Elysia } from 'elysia';
import { staticPlugin } from '@elysiajs/static';
import { render } from './src/server/render';
import {addUser, addUserCredential, getUserByEmail, updateUserChallenge} from './src/server/db';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  VerifiedRegistrationResponse, verifyAuthenticationResponse,
  verifyRegistrationResponse
} from '@simplewebauthn/server';
import { isoUint8Array, isoBase64URL } from '@simplewebauthn/server/helpers';
import {DevicePasskey} from './src/types';
import {convertAuthenticator, getAuthenticatorData, getDeviceRegistrationInfo} from './src/server/utils';

const PORT = 3013;
const rpID = 'localhost';
const rpName = 'webauth-app';
const expectedOrigin = 'http://localhost:3013';

const app = new Elysia();

app.use(staticPlugin({
	assets: 'dist',
	prefix: '/public'
}));

app.get('/*', async (ctx: Context): Promise<Response> => {
	const stream = await render(ctx);

	return new Response(stream, {
		headers: {
			'content-type': 'text/html',
		}
	});
});

app.post('/register/start', async (ctx: Context): Promise<any> => {
  const { user } = ctx.body as any;

  const dbUser = await addUser(user);

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: isoUint8Array.fromUTF8String(dbUser.email),
    // userID: dbUser._id.toString(),
    userName: dbUser.email,
    attestationType: 'none',
  });
  await updateUserChallenge(dbUser.email, options.challenge);

  return {
    options,
    user: dbUser,
  };
});

app.post('/register/finish', async (ctx: Context): Promise<any> => {
  const { userName, data } = ctx.body as any;

  let verification: VerifiedRegistrationResponse;
  const user = await getUserByEmail(userName);

  if(!user) {
    return ctx.error(400, { error: 'Invalid user'});
  }
  try {
    verification = await verifyRegistrationResponse({
      response: data,
      expectedChallenge: user.challenge,
      expectedOrigin: expectedOrigin,
      expectedRPID: rpID,
      requireUserVerification: false,
    });
  } catch(err) {
    console.log('Error verifying registration response');
    console.log(err);
  }

  if(verification) {
    const { verified, registrationInfo } = verification;
    if(verified) {
      const credential: DevicePasskey = getDeviceRegistrationInfo(
        registrationInfo,
        data.response.transports,
      );
      await addUserCredential(userName, credential);
      return {
        status: 'OK',
      }
    }
  }
});


app.post('/login/start', async (ctx: Context): Promise<any> => {
  const { userName } = ctx.body as any;

  const user = await getUserByEmail(userName);
  if(!user) {
    return ctx.error(400, { error: 'Invalid user'});
  }
  try {
    const options = await generateAuthenticationOptions({
      allowCredentials: user.credentials.map(convertAuthenticator),
      rpID,
      userVerification: 'required',
    });
    await updateUserChallenge(userName, options.challenge);
    return {
      options,
    }
  } catch(err) {
    console.log(err);
    console.log('------------------------------------ ');
  }
});

app.post('/login/finish', async (ctx: Context): Promise<any> => {
  const { userName, data } = ctx.body as any;

  console.log(userName);
  console.log(data);
  console.log('------------------------------------ ');

  const user = await getUserByEmail(userName);
  if(!user) {
    return ctx.error(400, 'Invalid User');
  }
  let verification = await verifyAuthenticationResponse({
    expectedChallenge: user.challenge,
    response: data,
    authenticator: getAuthenticatorData(user, data.rawId),
    expectedRPID: rpID,
    expectedOrigin,
  });
  const { verified } = verification;
  if(verified) {
    return {
      status: 'OK'
    }
  }
  return ctx.error(401, { status: 'Failed Auth' });
});

app.listen(PORT, () => {
	console.log(`App is listening on port ${PORT}`);
});

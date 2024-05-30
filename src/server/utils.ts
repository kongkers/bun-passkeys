import {VerifiedRegistrationResponse} from '@simplewebauthn/server';
import {DevicePasskey, PasskeyCredential, RegistrationInfo, User} from '../types';
import {
  AuthenticatorDevice,
  AuthenticatorTransportFuture,
  PublicKeyCredentialDescriptorFuture
} from '@simplewebauthn/typescript-types';

export function getNewChallenge() {
  return Math.random().toString(36).substring(2);
}

export function convertChallenge(challenge: string): string {
  const buf = Buffer.from(challenge, 'utf8');
  return buf.toString('base64');
}

function uintToString(a) {
  const base64string = btoa(String.fromCharCode(...a));
  return base64string.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64ToUint8Array(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
  return new Uint8Array(Array.prototype.map.call(atob(str), (c) => c.charCodeAt(0)));
}

/*
export function getSavedAuthenticatorData(user: User): PasskeyCredential {
  return {
    credentialID: base64ToUint8Array(user.credentials.credentialID),
    credentialPublicKey: base64ToUint8Array(user.credentials.credentialPublicKey),
    counter: user.credentials.counter,
  }
}

 */

export function convertAuthenticator(cred: DevicePasskey): PublicKeyCredentialDescriptorFuture {
  return {
    id: cred.credentialID,
    type: 'public-key',
    transports: cred.transports,
  }
}

export function getRegistrationInfo(registrationInfo: RegistrationInfo): DevicePasskey {
  const { credentialPublicKey, counter, credentialID } = registrationInfo;
  return {
    credentialID: uintToString(credentialID),
    credentialPublicKey: uintToString(credentialPublicKey),
    counter
  }
}

function getTransports (transports?: AuthenticatorTransportFuture[]): AuthenticatorTransportFuture[] {
  if(!transports) {
    return ['internal'];
  }
  return transports;
}

export function getAuthenticatorData(user: User, credentialID: string): AuthenticatorDevice{
  const len = user.credentials.length;
  for(let i=0; i< len; i++) {
    if (user.credentials[i].credentialID === credentialID) {
      return {
        credentialID: base64ToUint8Array(user.credentials[i].credentialID),
        credentialPublicKey: base64ToUint8Array(user.credentials[i].credentialPublicKey),
        counter: user.credentials[i].counter,
      }
    }
  }
  return null;
}

export function getDeviceRegistrationInfo(registrationInfo: RegistrationInfo, transports?: AuthenticatorTransportFuture[]): DevicePasskey {
  const { credentialPublicKey, counter, credentialID } = registrationInfo;

  return {
    credentialID: uintToString(credentialID),
    credentialPublicKey: uintToString(credentialPublicKey),
    counter,
    transports: getTransports(transports),
  };
}

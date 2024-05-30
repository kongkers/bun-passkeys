import {VerifiedRegistrationResponse} from '@simplewebauthn/server';
import {DevicePasskey, PasskeyCredential, RegistrationInfo, User} from '../types';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import {
  AuthenticatorDevice,
  AuthenticatorTransportFuture,
  PublicKeyCredentialDescriptorFuture
} from '@simplewebauthn/typescript-types';

function uintToString(a) {
  const base64string = btoa(String.fromCharCode(...a));
  return base64string.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64ToUint8Array(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
  return new Uint8Array(Array.prototype.map.call(atob(str), (c) => c.charCodeAt(0)));
}

export function convertAuthenticator(cred: DevicePasskey): PublicKeyCredentialDescriptorFuture {
  return {
    id: cred.credentialID ,
    type: 'public-key',
    transports: cred.transports,
  }
}

export function getRegistrationInfo(registrationInfo: RegistrationInfo): DevicePasskey {
  const { credentialPublicKey, counter, credentialID } = registrationInfo;
  return {
    credentialID,
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
    credentialID,
    credentialPublicKey: uintToString(credentialPublicKey),
    counter,
    transports: getTransports(transports),
  };
}

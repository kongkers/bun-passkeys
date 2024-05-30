import {
  AuthenticatorTransportFuture,
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON
} from '@simplewebauthn/typescript-types';
import {AttestationFormat} from '@simplewebauthn/server/esm/helpers/decodeAttestationObject';
import {CredentialDeviceType} from '@simplewebauthn/server/esm/deps';
import {
  AuthenticationExtensionsAuthenticatorOutputs
} from '@simplewebauthn/server/esm/helpers/decodeAuthenticatorExtensions';
import {ObjectId} from 'mongodb';

export type LoginRequest = {
  userName: string;
}

export type LoginFinish = {
  userName: string;
  data: any;
}

export type RegisterRequest = {
  user: User;
}

export type RegistrationOptions = {
  user: User;
  options: PublicKeyCredentialCreationOptionsJSON;
}

export type RegisterFinish = {
  userName: string;
  data: RegistrationResponseJSON;
}

export type RegistrationInfo = {
  fmt: AttestationFormat;
  counter: number;
  aaguid: string;
  credentialID: Uint8Array;
  credentialPublicKey: Uint8Array;
  credentialType: 'public-key';
  attestationObject: Uint8Array;
  userVerified: boolean;
  credentialDeviceType: CredentialDeviceType;
  credentialBackedUp: boolean;
  origin: string;
  rpID?: string;
  authenticatorExtensionResults?: AuthenticationExtensionsAuthenticatorOutputs;

}

export type PasskeyCredential = {
  credentialID: Uint8Array;
  credentialPublicKey: Uint8Array;
  counter: number;
  transports?: string[];
}

export type DevicePasskey = {
  credentialID: BufferSource;
  credentialPublicKey: string;
  counter: number;
  transports?: AuthenticatorTransportFuture[];
}

export type User = {
  _id?: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  challenge?: string;
  credentials?: DevicePasskey[];
}

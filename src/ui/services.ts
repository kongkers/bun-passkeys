import axios from 'axios';
import {PublicKeyCredentialCreationOptionsJSON} from '@simplewebauthn/typescript-types';
import {RegistrationOptions, User} from '../types';

export async function getRegistrationOptions(user: User): Promise<RegistrationOptions> {
  return axios({
    method: 'post',
    url: '/register/start',
    data: {
      user,
    }
  }).then(resp => {
    return resp.data;
  });
}

export async function verifyRegistration(userName: string, attResp: any): Promise<void> {
  return axios({
    method: 'post',
    url: '/register/finish',
    data: {
      userName,
      data: attResp,
    }
  });
}

export async function verifyAuthentication(userName: string, asseResp: any): Promise<any> {
  return axios({
    method: 'post',
    url: '/login/finish',
    data: {
      data: asseResp,
      userName,
    }
  }).then(resp => {
    return resp.data;
  });
}

export async function getLoginOptions(userName: string): Promise<any> {
  return axios({
    method: 'post',
    url: '/login/start',
    data: {
      userName,
    }
  }).then(resp => {
    console.log('do...');
    console.log(resp.data);
    return resp.data;
  })
}

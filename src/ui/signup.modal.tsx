import React, {FormEvent, ReactElement, useState} from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton, ModalContent, ModalFooter,
  ModalHeader,
  ModalOverlay
} from '@chakra-ui/react';
import {User} from '../types';
import {getRegistrationOptions, verifyRegistration} from './services';
import {startRegistration} from '@simplewebauthn/browser';

type SignUpProps = {
  isOpen: boolean;
  onClose: () => void;
}

const USER_DETAILS_DEFAULTS: User = {
  firstName: 'David',
  lastName: 'Kong',
  email: 'davkon@gmail.com',
  mobile: '0408540199',
}

export default function SignUp(props: SignUpProps): ReactElement {
  const [userDetails, setUserDetails] = useState(USER_DETAILS_DEFAULTS);

  const startSignup = (): void => {
    getRegistrationOptions(userDetails).then(resp => {
      startRegistration(resp.options).then(attResp => {
        verifyRegistration(resp.user.email, attResp).then(() => {
          props.onClose();
        });
      });
    });
  }

  const handleInputChange = (fieldName: string) => (event: FormEvent<HTMLInputElement>) => {
    const val: string = (event.target as HTMLInputElement).value;
    setUserDetails({
      ...userDetails,
      [fieldName]: val,
    })
  }

  return(
    <Modal isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Sign Up</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form>
            <ul className="form-list">
              <li>
                <FormControl>
                  <FormLabel>
                    First Name
                  </FormLabel>
                  <Input value={userDetails.firstName} onChange={handleInputChange('firstName')} />
                </FormControl>
              </li>
              <li>
                <FormControl>
                  <FormLabel>
                    Last Name
                  </FormLabel>
                  <Input value={userDetails.lastName} onChange={handleInputChange('lastName')} />
                </FormControl>
              </li>
              <li>
                <FormControl>
                  <FormLabel>
                    Email
                  </FormLabel>
                  <Input type="email" value={userDetails.email} onChange={handleInputChange('email')} />
                </FormControl>
              </li>
              <li>
                <FormControl>
                  <FormLabel>
                    Mobile
                  </FormLabel>
                  <Input type="tel" value={userDetails.mobile} onChange={handleInputChange('mobile')} />
                </FormControl>
              </li>
            </ul>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button onClick={props.onClose} className="mr-10">Cancel</Button>
          <Button onClick={startSignup}>Register</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

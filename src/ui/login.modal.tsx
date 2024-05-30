import React, {FormEvent, ReactElement, useState} from 'react';
import {
  Button,
  FormControl, FormLabel, Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent, ModalFooter,
  ModalHeader,
  ModalOverlay
} from '@chakra-ui/react';
import {getLoginOptions, verifyAuthentication} from './services';
import {startAuthentication} from '@simplewebauthn/browser';

type LoginProps = {
  isOpen: boolean;
  onClose: Function;
  showSuccess?: Function;
}

export default function Login(props: LoginProps): ReactElement {
  const [email, setEmail] = useState('');

  const handleInput = (event: FormEvent<HTMLInputElement>) => {
    const val: string = (event.target as HTMLInputElement).value;
    setEmail(val);
  }

  const doLogin = (): void => {
    getLoginOptions(email).then(resp => {
      startAuthentication(resp.options).then(asseResp => {
        verifyAuthentication(email, asseResp).then(data => {
          console.log(data.status);
          if(data.status === 'OK' && props.showSuccess) {
            props.showSuccess();
            props.onClose();
          }
        });
      });
    });
  }

  return(
   <Modal isOpen={props.isOpen} onClose={props.onClose}>
     <ModalOverlay />
     <ModalContent>
        <ModalHeader>Login</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form>
            <ul className="form-list">
              <li>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input value={email} onChange={handleInput} />
                </FormControl>
              </li>
            </ul>
          </form>
        </ModalBody>
       <ModalFooter>
         <Button onClick={props.onClose} className="mr-10">Cancel</Button>
         <Button onClick={doLogin}>Continue</Button>
       </ModalFooter>
     </ModalContent>
   </Modal>
  );
}

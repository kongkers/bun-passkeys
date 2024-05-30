import * as React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import App from './app';
import './styles.css';

const root = document.getElementById('root')!;

hydrateRoot(
  root,
  <ChakraProvider>
    <App />
  </ChakraProvider>
);


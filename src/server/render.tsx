import React, { ReactElement } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { Context } from 'elysia';
import { renderToReadableStream } from 'react-dom/server';
import App from '../ui/app';

export type HtmlProps = {
	children: any;
}

export function Html(props: HtmlProps): ReactElement {
	return(
		<html lang="eng">
			<head>
				<title>Passkeys Demo</title>
			</head>
			<body>
				<div id="root">
					{ props.children }
				</div>
			</body>
		</html>
	);
}

export async function render(context: Context) {
  const options = {
    bootstrapScripts: ['/public/index.js'],
  };


	const stream = renderToReadableStream(
		<Html>
      <ChakraProvider>
        <App />
      </ChakraProvider>
		</Html>,
    options
	);

	return stream;
}

import React from 'react';
import type {AppProps} from 'next/app';
import {MDXProvider} from '@mdx-js/react';
import {components} from '@sup39/mdx-components';
import '../styles/index.sass';

export default function App({Component, pageProps, router}: AppProps) {
  return <MDXProvider components={components}>
    <Component router={router} {...pageProps} />
  </MDXProvider>;
}

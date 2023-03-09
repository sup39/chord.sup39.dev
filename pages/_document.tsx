import {Html, Head, Main, NextScript} from 'next/document';

export default function Document() {
  return <Html>
    <Head>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.3/dist/katex.min.css" integrity="sha384-Juol1FqnotbkyZUT5Z7gUPjQ9gzlwCENvUZTpQBAPxtusdwFLRy382PSDx5UUJ4/" crossOrigin="anonymous" />
      <link rel="stylesheet" type="text/css" href="https://cdn.sup39.dev/css/index.css" />
      <link rel="icon" href="https://res.sup39.dev/icon.svg" />
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>;
}

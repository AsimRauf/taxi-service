import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg?v=2" />
        <link rel="shortcut icon" href="/favicon.svg?v=2" />
      </Head>
      <body>
        <Main />
        <NextScript />
        <script type="text/javascript">
          {`
            var sc_project=13194699; 
            var sc_invisible=1; 
            var sc_security="4caffc9e";
          `}
        </script>
        <script type="text/javascript" src="https://www.statcounter.com/counter/counter.js" async></script>
        <noscript>
          <div className="statcounter">
            <a title="web counter" href="https://statcounter.com/" target="_blank" rel="noreferrer">
              <img className="statcounter" src="https://c.statcounter.com/13194699/0/4caffc9e/1/" alt="web counter" referrerPolicy="no-referrer-when-downgrade" />
            </a>
          </div>
        </noscript>
      </body>
    </Html>
  );
}

import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";
export default function Document() {
  return (
    <Html lang="vi">
      <Head>
        {/* Sử dụng SDK chính thức từ Stringee */}
        <Script
          src="https://cdn.stringee.com/sdk/web/2.2.1/stringee-web-sdk.min.js"
          strategy="beforeInteractive"
        ></Script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

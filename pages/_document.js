import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="vi">
      <Head>
        {/* Sử dụng SDK chính thức từ Stringee */}
        <script src="https://cdn.stringee.com/sdk/web/2.2.1/stringee-web-sdk.min.js"></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

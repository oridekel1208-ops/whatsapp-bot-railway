// pages/_app.js
import '../styles/globals.css' // optional - create if you want global CSS
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}

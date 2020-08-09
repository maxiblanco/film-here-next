import '../styles/index.css';
import '@reach/combobox/styles.css';

import { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps): React.ReactNode {
  return <Component {...pageProps} />;
}

export default MyApp;

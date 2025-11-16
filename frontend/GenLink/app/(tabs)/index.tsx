import AppWebView from '@/components/app-webview';
import { BASE_URL } from '@/constants/config';

export default function HomeScreen() {
  const url = `${BASE_URL}/pomoc`;

  // Immediately show the remote 'pomoc' page inside the Home tab
  return <AppWebView uri={url} />;
}

// nothing else required - webview fills the screen

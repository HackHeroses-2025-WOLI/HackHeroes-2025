import React from 'react';

type Props = { uri: string };

export default function AppWebView({ uri }: Props) {
  return (
    <div style={{ height: '100%', width: '100%', overscrollBehavior: 'none' }}>
      <iframe
        title={uri}
        src={uri}
        style={{ width: '100%', height: '100%', border: 0, overscrollBehavior: 'none' }}
        sandbox="allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts"
      />
    </div>
  );
}

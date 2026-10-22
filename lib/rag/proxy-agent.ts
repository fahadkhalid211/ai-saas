import http from 'node:http';
import https from 'node:https';
import tls from 'node:tls';

/**
 * An https.Agent that reaches the internet through an HTTP(S) proxy (a CONNECT tunnel), with optional user:password. Used for YouTube,
 * which refuses the addresses of cloud hosts but answers a residential or rotating proxy. No extra dependency: it is the standard
 * CONNECT handshake followed by TLS to the real site over the tunnel, so the proxy sees only the host name, never the content.
 */
export function createProxiedHttpsAgent(proxyUrl: string, options: https.AgentOptions = {}): https.Agent {
  const proxy = new URL(proxyUrl);
  if (proxy.protocol !== 'http:' && proxy.protocol !== 'https:') {
    throw new Error('The proxy address must start with http:// or https://');
  }
  const auth =
    proxy.username || proxy.password
      ? 'Basic ' + Buffer.from(`${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`).toString('base64')
      : '';

  class TunnelAgent extends https.Agent {
    // Node calls this to open the socket for a request; answering through the callback lets the tunnel be set up first.
    createConnection(connectOptions: any, callback: (err: Error | null, socket?: any) => void): any {
      const targetHost: string = connectOptions.host || connectOptions.hostname;
      const targetPort: number = Number(connectOptions.port) || 443;
      const headers: Record<string, string> = { Host: `${targetHost}:${targetPort}` };
      if (auth) headers['Proxy-Authorization'] = auth;

      const transport = proxy.protocol === 'https:' ? https : http;
      const req = transport.request({
        host: proxy.hostname,
        port: Number(proxy.port) || (proxy.protocol === 'https:' ? 443 : 80),
        method: 'CONNECT',
        path: `${targetHost}:${targetPort}`,
        headers,
        timeout: 15000,
      });
      req.once('connect', (res, socket) => {
        if (res.statusCode !== 200) {
          socket.destroy();
          callback(new Error(`The proxy refused the connection (HTTP ${res.statusCode})`));
          return;
        }
        const secure = tls.connect({ socket, servername: connectOptions.servername || targetHost });
        callback(null, secure);
      });
      req.once('timeout', () => req.destroy(new Error('The proxy did not answer in time')));
      req.once('error', (err) => callback(err));
      req.end();
    }
  }

  return new TunnelAgent(options);
}

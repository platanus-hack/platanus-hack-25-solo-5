export function getChatUrl(preserveUTMs: boolean = true, modelId?: string, path?: string): string {
  if (typeof window !== 'undefined') {
    const { hostname, protocol, port } = window.location;

    let baseUrl = '';

    if (hostname.includes('localhost')) {
      baseUrl = `${protocol}//chat.${hostname}${port ? ':' + port : ''}`;
    } else if (hostname.startsWith('beta.')) {
      baseUrl = `${protocol}//betachat.chattia.app`;
    } else {
      baseUrl = `${protocol}//chat.chattia.app`;
    }

    if (path) {
      baseUrl += path;
    }

    const params = new URLSearchParams();

    if (modelId) {
      params.set('model', modelId);
    }

    if (preserveUTMs) {
      const currentParams = new URLSearchParams(window.location.search);
      const utmParams = [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
        'gclid',
        'fbclid',
        'ttclid',
        'msclkid'
      ];

      utmParams
        .filter(param => currentParams.has(param))
        .forEach(param => {
          const value = currentParams.get(param);
          if (value) params.set(param, value);
        });
    }

    const queryString = params.toString();
    if (queryString) {
      baseUrl += `?${queryString}`;
    }

    return baseUrl;
  }

  return process.env.NEXT_PUBLIC_CHAT_URL || '/chat';
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Cloudflare's static asset server skips dotfile paths like
    // /.well-known/* by default -- serve it explicitly here instead.
    if (url.pathname === '/.well-known/radix.json') {
      return new Response(
        JSON.stringify({
          dApps: [
            { dAppDefinitionAddress: 'account_tdx_2_12ynl5t4pp7263sz5ynukgex92zk44092gq0d6423wyml8vv3cqtvh9' },
          ],
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    return env.ASSETS.fetch(request);
  },
};

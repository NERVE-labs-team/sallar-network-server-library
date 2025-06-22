import Express from 'express';

export const config_application = (
  public_path: string
): Express.Application => {
  /* Create app instance */
  const app = Express();

  /* Parse JSONs in order to communicate with node-manager */
  app.use(Express.json());

  /* Config CORS */
  app.use((req, res, next): void => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, DELETE, PATCH'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader(
      'Content-Security-Policy',
      `frame-ancestors *; script-src 'self' 'unsafe-eval' 'unsafe-inline' *;`
    );

    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    next();
  });

  /* Config path to frontend program */
  app.use(
    Express.static(public_path, {
      setHeaders: (res) => {
        res.setHeader('Content-Security-Policy', 'frame-ancestors *;');
      },
    })
  );

  return app;
};

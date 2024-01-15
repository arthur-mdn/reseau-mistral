const config = {
    instanceUrl: import.meta.env.VITE_INSTANCE_URL,
    serverUrl: import.meta.env.VITE_SERVER_URL,
    cookieDomain: import.meta.env.VITE_COOKIE_DOMAIN,
    demoMode: import.meta.env.VITE_DEMO_MODE === 'true'
};

export default config;
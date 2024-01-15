const config = {
    instanceUrl: import.meta.env.VITE_INSTANCE_URL,
    serverUrl: import.meta.env.VITE_SERVER_URL,
    demoMode: import.meta.env.VITE_DEMO_MODE === 'true'
};

export default config;
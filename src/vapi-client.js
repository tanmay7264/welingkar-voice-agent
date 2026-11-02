import VapiModule from '@vapi-ai/web';

// The SDK's CommonJS default export is wrapped by ESM bundlers.
export default VapiModule.default ?? VapiModule;

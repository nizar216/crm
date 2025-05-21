import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: false,
  apiUrl: 'http://localhost:5026/api',
  backendUrl: 'http://localhost:5026'
};
import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  apiUrl: 'http://localhost:5026/api',
  backendUrl: 'http://localhost:5026'
};

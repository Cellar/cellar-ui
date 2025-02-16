export const config = {
  get appUrl() {
    return process.env.APP_URL ?? 'http://localhost:5173';
  },
  get apiUrl() {
    return this.appUrl + '/api';
  },
};

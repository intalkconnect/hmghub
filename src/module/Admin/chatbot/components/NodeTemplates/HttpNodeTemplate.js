export const HttpNodeTemplate = {
  type: 'http',
  label: 'HTTP Request',
  iconName: 'Globe',
  color: '#7B1FA2',
  block: {
    type: 'http',
    awaitResponse: false,
    awaitTimeInSeconds: 0,
    sendDelayInSeconds: 1,
    actions: [],
    content: {
      method: 'GET',
      url: '',
      headers: '',
      body: ''
    }
  },
};

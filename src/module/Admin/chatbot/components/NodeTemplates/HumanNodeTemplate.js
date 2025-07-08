export const HumanNodeTemplate = {
  label: 'Atendimento Humano',
  type: 'human',
  color: '#8E24AA',
  iconName: 'Headset',
  block: {
    type: 'human',
    content: {
      queueName: '',
    },
    awaitResponse: true,
    awaitTimeInSeconds: 0,
    sendDelayInSeconds: 0,
    actions: [],
  },
};

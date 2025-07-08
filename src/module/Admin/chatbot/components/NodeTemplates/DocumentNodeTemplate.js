// src/components/NodeTemplates/DocumentNodeTemplate.js
export const DocumentNodeTemplate = {
  type: 'document',
  label: 'Documento',
  iconName: 'HelpCircle',
  color: '#6A1B9A',
  block: {
    type: 'document',
    awaitResponse: false,
    awaitTimeInSeconds: 0,
    sendDelayInSeconds: 1,
    actions: [],
    content: {
      url: 'https://www.exemplo.com/arquivo.pdf',
      caption: '📄 Aqui está seu documento',
    },
  },
};

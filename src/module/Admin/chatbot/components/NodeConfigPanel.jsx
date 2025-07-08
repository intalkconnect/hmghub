import React, { useState, useEffect } from 'react';
import { Trash2 } from "lucide-react";

export default function NodeConfigPanel({
  selectedNode,
  onChange,
  onClose,
  allNodes = [],
  onConnectNodes,
}) {
  const [tab, setTab] = useState("conteudo");
  const [flowHistory, setFlowHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false)
  

    useEffect(() => {
    fetchLatestFlows();
      
  }, []);



  const fetchLatestFlows = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("https://ia-srv-meta.9j9goo.easypanel.host/api/v1/flow/latest");
      const data = await res.json();
      setFlowHistory(data.slice(0, 10));
    } catch (err) {
      console.error("Erro ao carregar histórico de fluxos", err);
    } finally {
      setLoadingHistory(false);
    }
  };

const handleRestore = async (id) => {
  try {
    // Ativa o fluxo primeiro
    await fetch("https://ia-srv-meta.9j9goo.easypanel.host/api/v1/flow/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    // Depois recarrega a página para aplicar o fluxo ativo
    window.location.reload();
  } catch (err) {
    alert("Erro ao restaurar fluxo");
  }
};

  if (!selectedNode) return (
    <aside style={asideStyle}>
      <h3>Histórico de Fluxos</h3>
      {loadingHistory ? <p>Carregando...</p> : (
        flowHistory.map((flow) => (
          <div key={flow.id} style={{ marginBottom: '1rem' }}>
            <strong>ID:</strong> {flow.id.slice(0, 8)}...<br />
            <strong>Data:</strong> {new Date(flow.created_at).toLocaleString()}<br />
            <button onClick={() => handleRestore(flow.id)} style={inputStyle}>
              Restaurar
            </button>
          </div>
        ))
      )}
    </aside>
  );

  const { block } = selectedNode.data;
  const {
    type,
    content = {},
    awaitResponse,
    awaitTimeInSeconds,
    sendDelayInSeconds,
    actions = [],
  } = block;

  const updateBlock = (changes) => {
    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        block: {
          ...block,
          ...changes,
        },
      },
    };
    onChange(updatedNode);
  };

  const updateContent = (field, value) => {
    updateBlock({
      content: {
        ...content,
        [field]: value,
      },
    });
  };

  const handleUpdateRows = (rows) => {
    const updatedSections = [
      {
        ...content.action?.sections?.[0],
        title: content.action?.sections?.[0]?.title || "",
        rows,
      },
    ];
    updateContent("action", { ...content.action, sections: updatedSections });
  };

  const updateActions = (newActions) => {
    updateBlock({ actions: newActions });
  };

  const renderActionsTab = () => (
    <>
      <h4 style={sectionTitle}>
        Condições de Saída{" "}
        <span style={{ color: "#aaa", fontSize: "12px" }}>
          ({actions.length}/25)
        </span>
      </h4>

      {actions.map((action, actionIdx) => (
        <React.Fragment key={actionIdx}>
          {actionIdx > 0 && (
            <div
              style={{ textAlign: "center", margin: "1rem 0", color: "#888" }}
            >
              <hr style={{ borderColor: "#333" }} />
              <span
                style={{
                  background: "#1e1e1e",
                  padding: "0 8px",
                  fontSize: "12px",
                }}
              >
                OU
              </span>
            </div>
          )}

          <div style={actionBox}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <strong>Condição {actionIdx + 1}</strong>
              <Trash2
                size={16}
                color="#f55"
                style={trashIconStyle}
                onClick={() => {
                  const updated = [...actions];
                  updated.splice(actionIdx, 1);
                  updateActions(updated);
                }}
              />
            </div>

            {(action.conditions || []).map((cond, condIdx) => (
              <div key={condIdx} style={conditionRow}>
                <select
                  value={
                    cond.variable === "lastUserMessage"
                      ? "lastUserMessage"
                      : "custom"
                  }
                  onChange={(e) => {
                    const updated = [...actions];
                    updated[actionIdx].conditions[condIdx].variable =
                      e.target.value === "lastUserMessage"
                        ? "lastUserMessage"
                        : "";
                    updateActions(updated);
                  }}
                  style={inputStyle}
                >
                  <option value="lastUserMessage">Resposta do usuário</option>
                  <option value="custom">Variável</option>
                </select>

                {cond.variable !== "lastUserMessage" && (
                  <input
                    type="text"
                    placeholder="Nome da variável"
                    value={cond.variable}
                    onChange={(e) => {
                      const updated = [...actions];
                      updated[actionIdx].conditions[condIdx].variable =
                        e.target.value;
                      updateActions(updated);
                    }}
                    style={inputStyle}
                  />
                )}

                <select
                  value={cond.type}
                  onChange={(e) => {
                    const updated = [...actions];
                    updated[actionIdx].conditions[condIdx].type =
                      e.target.value;
                    updateActions(updated);
                  }}
                  style={inputStyle}
                >
                  <option value="">Tipo de condição</option>
                  <option value="exists">Existe</option>
                  <option value="equals">Igual a</option>
                  <option value="not_equals">Diferente de</option>
                  <option value="contains">Contém</option>
                  <option value="not_contains">Não contém</option>
                </select>

                {cond.type !== "exists" && (
                  <input
                    type="text"
                    placeholder="Valor"
                    value={cond.value}
                    onChange={(e) => {
                      const updated = [...actions];
                      updated[actionIdx].conditions[condIdx].value =
                        e.target.value;
                      updateActions(updated);
                    }}
                    style={inputStyle}
                  />
                )}

                <Trash2
                  size={16}
                  color="#f55"
                  style={trashIconStyle}
                  onClick={() => {
                    const updated = [...actions];
                    updated[actionIdx].conditions.splice(condIdx, 1);
                    updateActions(updated);
                  }}
                />
              </div>
            ))}

            <button
              onClick={() => {
                const newAction = {
                  next: "",
                  conditions: [
                    { variable: "lastUserMessage", type: "exists", value: "" },
                  ],
                };
                updateActions([...actions, newAction]);
              }}
              style={smallButton}
            >
              + Adicionar condição
            </button>

            <label>Ir para:</label>
            <select
              value={action.next}
              onChange={(e) => {
                const targetId = e.target.value;
                const updated = [...actions];
                updated[actionIdx].next = targetId;
                updateActions(updated);

                // conecta visualmente se função estiver disponível
                if (onConnectNodes && targetId) {
                  onConnectNodes({
                    source: selectedNode.id,
                    target: targetId,
                  });
                }
              }}
              style={inputStyle}
            >
              <option value="">Selecione um bloco...</option>
              {allNodes
                .filter((n) => n.id !== selectedNode.id)
                .map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.data.label || node.id}
                  </option>
                ))}
            </select>
          </div>
        </React.Fragment>
      ))}

      <button
        onClick={() => {
          const newAction = {
            next: "",
            conditions: [
              { variable: "lastUserMessage", type: "exists", value: "" },
            ],
          };
          updateActions([...actions, newAction]);
        }}
        style={inputStyle}
      >
        + Adicionar ação
      </button>

      {/* Saída Padrão */}
      <h4 style={sectionTitle}>Saída Padrão</h4>
      <label>Ir para:</label>
      <select
        value={block.defaultNext || ""}
        onChange={(e) => updateBlock({ defaultNext: e.target.value })}
        style={inputStyle}
      >
        <option value="">Selecione um bloco...</option>
        {allNodes
          .filter((n) => n.id !== selectedNode.id)
          .map((node) => (
            <option key={node.id} value={node.id}>
              {node.data.label || node.id}
            </option>
          ))}
      </select>
      {/* <small style={{ fontSize: "11px", color: "#aaa" }}>
        A seta que liga os blocos não será exibida
      </small> */}
    </>
  );

  const renderContentTab = () => {
    if (type === "text") {
      return (
        <>
          <label>Mensagem</label>
          <textarea
            rows={5}
            value={block.content || ""}
            onChange={(e) => updateBlock({ content: e.target.value })}
            style={inputStyle}
          />

          <label>Aguardar resposta?</label>
          <select
            value={awaitResponse}
            onChange={(e) =>
              updateBlock({ awaitResponse: e.target.value === "true" })
            }
            style={inputStyle}
          >
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
          <label>Atraso de envio (segundos)</label>
          <input
            type="number"
            value={sendDelayInSeconds}
            onChange={(e) =>
              updateBlock({ sendDelayInSeconds: parseInt(e.target.value) })
            }
            style={inputStyle}
          />
        </>
      );
    }

    if (type === "media") {
      return (
        <>
          <label>Tipo de mídia</label>
          <select
            value={content.mediaType || "image"}
            onChange={(e) => updateContent("mediaType", e.target.value)}
            style={inputStyle}
          >
            <option value="image">Imagem</option>
            <option value="document">Documento</option>
            <option value="audio">Áudio</option>
            <option value="video">Vídeo</option>
          </select>

          <label>URL</label>
          <input
            type="text"
            value={content.url || ""}
            onChange={(e) => updateContent("url", e.target.value)}
            style={inputStyle}
          />

          <label>Legenda</label>
          <input
            type="text"
            value={content.caption || ""}
            onChange={(e) => updateContent("caption", e.target.value)}
            style={inputStyle}
          />
          <label>Aguardar resposta?</label>
          <select
            value={awaitResponse}
            onChange={(e) =>
              updateBlock({ awaitResponse: e.target.value === "true" })
            }
            style={inputStyle}
          >
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
          <label>Atraso de envio (segundos)</label>
          <input
            type="number"
            value={sendDelayInSeconds}
            onChange={(e) =>
              updateBlock({ sendDelayInSeconds: parseInt(e.target.value) })
            }
            style={inputStyle}
          />
        </>
      );
    }
    if (type === "human") {
      return (
        <>
          <label>Nome da fila de atendimento</label>
          <input
            type="text"
            value={content.queueName || ""}
            onChange={(e) => updateContent("queueName", e.target.value)}
            style={inputStyle}
          />
        </>
      );
    }

    if (type === "interactive") {
      const isList = content.type === "list";
      const isQuickReply = content.type === "button";

      const handleAddButton = () => {
        const current = content.action?.buttons || [];
        if (current.length >= 3) return alert("Máximo de 3 botões atingido.");
        const updated = [
          ...current,
          {
            type: "reply",
            reply: {
              id: `btn_${current.length + 1}`,
              title: "",
            },
          },
        ];
        updateContent("action", { ...content.action, buttons: updated });
      };

      const handleRemoveButton = (index) => {
        const updated = [...content.action.buttons];
        updated.splice(index, 1);
        updateContent("action", { ...content.action, buttons: updated });
      };

      const handleAddListItem = () => {
        const rows = content.action?.sections?.[0]?.rows || [];
        if (rows.length >= 10) return alert("Máximo de 10 itens atingido.");
        const newItem = {
          id: `item_${rows.length + 1}`,
          title: "",
          description: "",
        };
        const updatedSections = [
          {
            ...(content.action?.sections?.[0] || {}),
            title: content.action?.sections?.[0]?.title || "",
            rows: [...rows, newItem],
          },
        ];
        updateContent("action", {
          ...content.action,
          sections: updatedSections,
        });
      };

      const handleRemoveListItem = (index) => {
        const rows = [...(content.action?.sections?.[0]?.rows || [])];
        rows.splice(index, 1);
        const updatedSections = [
          {
            ...content.action.sections[0],
            rows,
          },
        ];
        updateContent("action", {
          ...content.action,
          sections: updatedSections,
        });
      };

      const handleUpdateRows = (rows) => {
        updateContent("action", {
          ...content.action,
          sections: [
            {
              ...content.action.sections?.[0],
              rows,
            },
          ],
        });
      };

      return (
        <>
          <label>Tipo de interativo</label>
          <select
            value={content.type || "button"}
            onChange={(e) => {
              const newType = e.target.value;

              if (newType === "list") {
                updateBlock({
                  content: {
                    type: "list",
                    body: { text: "Escolha um item da lista:" },
                    footer: { text: "Toque para selecionar" },
                    header: { text: "🎯 Menu de Opções", type: "text" },
                    action: {
                      button: "Abrir lista",
                      sections: [
                        {
                          title: "Seção 1",
                          rows: [
                            {
                              id: "item_1",
                              title: "Item 1",
                              description: "Descrição do item 1",
                            },
                          ],
                        },
                      ],
                    },
                  },
                });
              } else {
                updateBlock({
                  content: {
                    type: "button",
                    body: { text: "Deseja continuar?" },
                    footer: { text: "Selecione uma opção" },
                    action: {
                      buttons: [
                        {
                          type: "reply",
                          reply: {
                            id: "sim",
                            title: "👍 Sim",
                          },
                        },
                        {
                          type: "reply",
                          reply: {
                            id: "nao",
                            title: "👎 Não",
                          },
                        },
                      ],
                    },
                  },
                });
              }
            }}
            style={inputStyle}
          >
            <option value="button">Quick Reply</option>
            <option value="list">Menu List</option>
          </select>

          <label>Corpo</label>
          <input
            type="text"
            value={content.body?.text || ""}
            onChange={(e) => {
              const newType = e.target.value;

              if (newType === "list") {
                updateBlock({
                  content: {
                    type: "list",
                    body: { text: "Escolha um item da lista:" },
                    footer: { text: "Toque para selecionar" },
                    header: { text: "🎯 Menu de Opções", type: "text" },
                    action: {
                      button: "Abrir lista",
                      sections: [
                        {
                          title: "Seção 1",
                          rows: [
                            {
                              id: "item_1",
                              title: "Item 1",
                              description: "Descrição do item 1",
                            },
                            {
                              id: "item_2",
                              title: "Item 2",
                              description: "Descrição do item 2",
                            },
                          ],
                        },
                      ],
                    },
                  },
                });
              } else {
                updateBlock({
                  content: {
                    type: "button",
                    body: { text: "Deseja continuar?" },
                    footer: { text: "Selecione uma opção" },
                    action: {
                      buttons: [
                        {
                          type: "reply",
                          reply: {
                            id: "sim",
                            title: "👍 Sim",
                          },
                        },
                        {
                          type: "reply",
                          reply: {
                            id: "nao",
                            title: "👎 Não",
                          },
                        },
                      ],
                    },
                  },
                });
              }
            }}
            style={inputStyle}
          />

          <label>Rodapé</label>
          <input
            type="text"
            value={content.footer?.text || ""}
            onChange={(e) =>
              updateContent("footer", {
                ...content.footer,
                text: e.target.value,
              })
            }
            style={inputStyle}
          />

          <label>Aguardar resposta?</label>
          <select
            value={awaitResponse}
            onChange={(e) =>
              updateBlock({ awaitResponse: e.target.value === "true" })
            }
            style={inputStyle}
          >
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>

          <label>Atraso de envio (segundos)</label>
          <input
            type="number"
            value={sendDelayInSeconds}
            onChange={(e) =>
              updateBlock({ sendDelayInSeconds: parseInt(e.target.value) })
            }
            style={inputStyle}
          />

          {isList && (
            <>
              <label>Título da seção</label>
              <input
                type="text"
                value={content.action?.sections?.[0]?.title || ""}
                onChange={(e) =>
                  updateContent("action", {
                    ...content.action,
                    sections: [
                      {
                        ...content.action?.sections?.[0],
                        title: e.target.value,
                        rows: content.action?.sections?.[0]?.rows || [],
                      },
                    ],
                  })
                }
                style={inputStyle}
              />

              {(content.action?.sections?.[0]?.rows || []).map((item, idx) => (
                <div key={idx} style={rowItemStyle}>
                  <input
                    type="text"
                    value={item.title}
                    maxLength={24}
                    placeholder="Título"
                    onChange={(e) => {
                      const updated = [...content.action.sections[0].rows];
                      updated[idx].title = e.target.value.slice(0, 24);
                      handleUpdateRows(updated);
                    }}
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    value={item.description}
                    placeholder="Descrição"
                    onChange={(e) => {
                      const updated = [...content.action.sections[0].rows];
                      updated[idx].description = e.target.value;
                      handleUpdateRows(updated);
                    }}
                    style={inputStyle}
                  />
                  <Trash2
                    size={18}
                    color="#f55"
                    style={trashIconStyle}
                    onClick={() => handleRemoveListItem(idx)}
                    title="Remover item"
                  />
                </div>
              ))}

              <button onClick={handleAddListItem} style={inputStyle}>
                + Adicionar item
              </button>
            </>
          )}

          {isQuickReply && (
            <>
              {(content.action?.buttons || []).map((btn, idx) => (
                <div key={idx} style={rowItemStyle}>
                  <input
                    type="text"
                    value={btn.reply?.title || ""}
                    maxLength={20}
                    placeholder="Texto do botão"
                    onChange={(e) => {
                      const updated = [...content.action.buttons];
                      updated[idx] = {
                        ...btn,
                        reply: {
                          ...btn.reply,
                          title: e.target.value.slice(0, 20),
                        },
                      };
                      updateContent("action", {
                        ...content.action,
                        buttons: updated,
                      });
                    }}
                    style={inputStyle}
                  />
                  <Trash2
                    size={18}
                    color="#f55"
                    style={trashIconStyle}
                    onClick={() => handleRemoveButton(idx)}
                    title="Remover botão"
                  />
                </div>
              ))}

              <button onClick={handleAddButton} style={inputStyle}>
                + Adicionar botão
              </button>
            </>
          )}
        </>
      );
    }

    if (type === "location") {
      return (
        <>
          <label>Nome</label>
          <input
            type="text"
            value={content.name || ""}
            onChange={(e) => updateContent("name", e.target.value)}
            style={inputStyle}
          />
          <label>Endereço</label>
          <input
            type="text"
            value={content.address || ""}
            onChange={(e) => updateContent("address", e.target.value)}
            style={inputStyle}
          />
          <label>Latitude</label>
          <input
            type="text"
            value={content.latitude || ""}
            onChange={(e) => updateContent("latitude", e.target.value)}
            style={inputStyle}
          />
          <label>Longitude</label>
          <input
            type="text"
            value={content.longitude || ""}
            onChange={(e) => updateContent("longitude", e.target.value)}
            style={inputStyle}
          />
          <label>Aguardar resposta?</label>
          <select
            value={awaitResponse}
            onChange={(e) =>
              updateBlock({ awaitResponse: e.target.value === "true" })
            }
            style={inputStyle}
          >
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
          <label>Atraso de envio (segundos)</label>
          <input
            type="number"
            value={sendDelayInSeconds}
            onChange={(e) =>
              updateBlock({ sendDelayInSeconds: parseInt(e.target.value) })
            }
            style={inputStyle}
          />
        </>
      );
    }

    if (type === "code") {
      return (
        <>
          <label>Script</label>
          <textarea
            rows={5}
            value={block.code || ""}
            onChange={(e) => updateBlock({ code: e.target.value })}
            style={inputStyle}
          />
          <label>Função</label>
          <input
            type="text"
            value={block.function || ""}
            onChange={(e) => updateBlock({ function: e.target.value })}
            style={inputStyle}
          />
          <label>Variável de saída</label>
          <input
            type="text"
            value={block.outputVar || ""}
            onChange={(e) => updateBlock({ outputVar: e.target.value })}
            style={inputStyle}
          />
        </>
      );
    }

    if (type === "http") {
      return (
        <>
          <label>Método</label>
          <select
            value={content.method || "GET"}
            onChange={(e) => updateContent("method", e.target.value)}
            style={inputStyle}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>

          <label>URL</label>
          <input
            type="text"
            value={content.url || ""}
            onChange={(e) => updateContent("url", e.target.value)}
            style={inputStyle}
          />

          <label>Headers (JSON)</label>
          <textarea
            rows={3}
            value={content.headers || ""}
            onChange={(e) => updateContent("headers", e.target.value)}
            style={inputStyle}
          />

          <label>Body (JSON)</label>
          <textarea
            rows={4}
            value={content.body || ""}
            onChange={(e) => updateContent("body", e.target.value)}
            style={inputStyle}
          />
        </>
      );
    }

    return null;
  };

  return (
    <aside style={asideStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ marginBottom: "1rem", color: "#4FC3F7" }}>
          {selectedNode.data.label}
        </h3>
        <button
          onClick={() => onClose()}
          style={{
            background: "transparent",
            border: "none",
            color: "#f55",
            fontSize: "18px",
            cursor: "pointer",
          }}
          title="Fechar"
        >
          ✕
        </button>
      </div>

      <label style={{ fontWeight: "bold" }}>Nome do Bloco</label>
      <input
        type="text"
        value={selectedNode.data.label}
        onChange={(e) =>
          onChange({
            ...selectedNode,
            data: {
              ...selectedNode.data,
              label: e.target.value,
            },
          })
        }
        style={inputStyle}
      />

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          style={tabStyle(tab === "conteudo")}
          onClick={() => setTab("conteudo")}
        >
          Conteúdo
        </button>
        <button
          style={tabStyle(tab === "acoes")}
          onClick={() => setTab("acoes")}
        >
          Ações
        </button>
      </div>

      {tab === "conteudo" && renderContentTab()}
      {tab === "acoes" && renderActionsTab()}
    </aside>
  );
}

const asideStyle = {
  position: "absolute",
  top: 0,
  right: 0,
  width: "340px",
  height: "100%",
  background: "#1e1e1e",
  color: "#fff",
  padding: "1rem",
  borderLeft: "1px solid #333",
  overflowY: "auto",
  zIndex: 1000,
};

const inputStyle = {
  width: "100%",
  padding: "0.5rem",
  marginBottom: "0.5rem",
  borderRadius: "4px",
  border: "1px solid #555",
  background: "#2a2a2a",
  color: "#fff",
};

const tabStyle = (active) => ({
  padding: "0.5rem 1rem",
  background: active ? "#444" : "#222",
  color: "#fff",
  border: "1px solid #444",
  borderBottom: active ? "2px solid #0f0" : "none",
  cursor: "pointer",
});

const rowItemStyle = {
  display: "flex",
  flexDirection: "column",
  marginBottom: "0.5rem",
  position: "relative",
};

const trashIconStyle = {
  cursor: "pointer",
  opacity: 0.7,
  transition: "opacity 0.2s",
};
const sectionTitle = {
  fontSize: "14px",
  fontWeight: "bold",
  margin: "1rem 0 0.5rem",
  borderBottom: "1px solid #444",
  paddingBottom: "0.25rem",
};

const actionBox = {
  background: "#2a2a2a",
  border: "1px solid #444",
  borderRadius: "6px",
  padding: "0.75rem",
  marginBottom: "1rem",
};

const conditionRow = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  marginBottom: "0.5rem",
};

const smallButton = {
  backgroundColor: "#444",
  color: "#fff",
  border: "1px solid #666",
  padding: "6px",
  borderRadius: "4px",
  marginBottom: "0.5rem",
  cursor: "pointer",
  fontSize: "12px",
};

const addBlockButton = {
  ...smallButton,
  width: "100%",
  backgroundColor: "#2e7d32",
  borderColor: "#2e7d32",
};

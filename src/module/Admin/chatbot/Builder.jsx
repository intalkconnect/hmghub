import React, { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

import { nodeTemplates } from "./components/NodeTemplates";

import NodeQuadrado from "./components/NodeQuadrado";
import NodeConfigPanel from "./components/NodeConfigPanel";
import {
  Zap,
  HelpCircle,
  MessageCircle,
  Code,
  Globe,
  Image,
  Rocket,
  Download,
  MapPin,
  HeadphonesIcon,
  ArrowDownCircleIcon,
} from "lucide-react";

const iconMap = {
  Zap: <Zap size={16} />,
  HelpCircle: <HelpCircle size={16} />,
  MessageCircle: <MessageCircle size={16} />,
  Code: <Code size={16} />,
  Globe: <Globe size={16} />,
  Image: <Image size={16} />,
  MapPin: <MapPin size={16} />,
  Headset: <HeadphonesIcon size={16} />,
  ListEnd: <ArrowDownCircleIcon size={16} />,
};

const nodeTypes = {
  quadrado: NodeQuadrado,
};

export default function Builder() {
  const [nodes, setNodes] = useState([
    {
      id: "1",
      type: "quadrado",
      position: { x: 100, y: 100 },
      data: {
        label: "Boas-vindas",
        type: "start",
        color: "#546E7A",
        block: {
          type: "text",
          content: "Olá!",
          awaitResponse: true,
          awaitTimeInSeconds: 0,
          sendDelayInSeconds: 1,
          actions: [],
          defaultNext: "onError", // <- adicionado aqui
        },
      },
    },
    {
      id: "onError",
      type: "quadrado",
      position: { x: 300, y: 100 },
      data: {
        label: "onError",
        type: "text",
        color: "#FF4500",
        block: {
          type: "text",
          content: "⚠️ Algo deu errado. Tente novamente mais tarde.",
          awaitResponse: false,
          awaitTimeInSeconds: 0,
          sendDelayInSeconds: 1,
          actions: [],
        },
      },
    },
  ]);

  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [highlightedNodeId, setHighlightedNodeId] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const onNodesChange = useCallback((changes) => {
    setNodes((nds) =>
      applyNodeChanges(
        changes,
        nds.map((node) => {
          const change = changes.find(
            (c) => c.id === node.id && c.type === "position"
          );
          return change ? { ...node, position: change.position } : node;
        })
      )
    );
  }, []);

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback((params) => {
    const { source, target } = params;

    // Adiciona a linha visual
    setEdges((eds) => addEdge(params, eds));

    // Atualiza o bloco com a ação de saída padrão
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === source) {
          return {
            ...node,
            data: {
              ...node.data,
              block: {
                ...node.data.block,
                actions: [
                  ...(node.data.block.actions || []),
                  {
                    next: target,
                    conditions: [
                      {
                        variable: "lastUserMessage",
                        type: "exists",
                        value: "",
                      },
                    ],
                  },
                ],
              },
            },
          };
        }
        return node;
      })
    );
  }, []);

  const onNodeDoubleClick = (_, node) => {
    setSelectedNode(node);
  };

  const updateSelectedNode = (updated) => {
    if (!updated) {
      setSelectedNode(null);
      return;
    }

    setNodes((nds) => nds.map((n) => (n.id === updated.id ? updated : n)));
    setSelectedNode(updated);
  };

  const handleConnectNodes = ({ source, target }) => {
    // Cria visualmente a conexão
    setEdges((eds) => [...eds, { id: `${source}-${target}`, source, target }]);

    // Atualiza o bloco source com nova ação padrão
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === source) {
          const existingActions = node.data.block.actions || [];
          return {
            ...node,
            data: {
              ...node.data,
              block: {
                ...node.data.block,
                actions: [
                  ...existingActions,
                  {
                    next: target,
                    conditions: [
                      {
                        variable: "lastUserMessage",
                        type: "exists",
                        value: "",
                      },
                    ],
                  },
                ],
              },
            },
          };
        }
        return node;
      })
    );
  };

  const handleDelete = useCallback(() => {
    if (
      !selectedNode ||
      selectedNode.data.label === "Boas-vindas" ||
      selectedNode.data.label.toLowerCase().includes("onerror")
    )
      return;

    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) =>
      eds.filter(
        (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
      )
    );
    setSelectedNode(null);
  }, [selectedNode]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Delete") {
        if (selectedEdgeId) {
          setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId));
          setSelectedEdgeId(null);

          // Remover action do nó de origem
          setNodes((nds) =>
            nds.map((node) => {
              const updatedActions = (node.data.block.actions || []).filter(
                (a) =>
                  a.next !== edges.find((e) => e.id === selectedEdgeId)?.target
              );
              return {
                ...node,
                data: {
                  ...node.data,
                  block: {
                    ...node.data.block,
                    actions: updatedActions,
                  },
                },
              };
            })
          );
        } else if (
          selectedNode &&
          selectedNode.data.label !== "Boas-vindas" &&
          !selectedNode.data.label.toLowerCase().includes("onerror")
        ) {
          setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
          setEdges((eds) =>
            eds.filter(
              (e) =>
                e.source !== selectedNode.id && e.target !== selectedNode.id
            )
          );
          setSelectedNode(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedEdgeId, selectedNode, edges]);

  useEffect(() => {
    const loadLatestFlow = async () => {
      try {
        const latestRes = await fetch(
          "https://ia-srv-meta.9j9goo.easypanel.host/api/v1/flow/latest"
        );
        const latestData = await latestRes.json();
        const latestFlowId = latestData[0]?.id;

        if (!latestFlowId) return;

        const flowRes = await fetch(
          `https://ia-srv-meta.9j9goo.easypanel.host/api/v1/flow/data/${latestFlowId}`
        );
        const flowData = await flowRes.json();

        const loadedNodes = [];
        const loadedEdges = [];

        Object.entries(flowData.blocks).forEach(([label, block]) => {
          loadedNodes.push({
            id: label,
            type: "quadrado",
            position: block.position || { x: 100, y: 100 },
            data: {
              label,
              type: block.type,
              color: block.color || "#607D8B",
              block,
            },
          });

          (block.actions || []).forEach((action) => {
            loadedEdges.push({
              id: `${label}-${action.next}`,
              source: label,
              target: action.next,
            });
          });
        });

        setNodes(loadedNodes);
        setEdges(loadedEdges);
      } catch (err) {
        console.error("Erro ao carregar fluxo ativo", err);
      }
    };

    loadLatestFlow();
  }, []);

  const handlePublish = async () => {
    setIsPublishing(true);

    const nodeIdMap = Object.fromEntries(
      nodes.map((n) => [n.id, n.data.label.replace(/\s+/g, "_").toLowerCase()])
    );

    const blocks = {};
    nodes.forEach((node) => {
      const id = nodeIdMap[node.id];
      const originalBlock = node.data.block;

      // Clona o bloco e substitui defaultNext com nome, se houver
      const clonedBlock = {
        ...originalBlock,
        defaultNext: originalBlock.defaultNext
          ? nodeIdMap[originalBlock.defaultNext] || originalBlock.defaultNext
          : undefined,
      };

      // Substitui também os "next" de cada action (se houver)
      if (originalBlock.actions && originalBlock.actions.length > 0) {
        clonedBlock.actions = originalBlock.actions.map((action) => ({
          next: nodeIdMap[action.next] || action.next,
          conditions: action.conditions || [],
        }));
      }

      blocks[id] = {
        ...clonedBlock,
        position: node.position, // <- salva posição
        color: node.data.color, // <- salva cor atual (opcional)
      };
    });

    const flowData = {
      data: {
        start: nodeIdMap[nodes[0]?.id],
        blocks,
      },
    };

    try {
      const response = await fetch(
        "https://ia-srv-meta.9j9goo.easypanel.host/api/v1/flow/publish",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(flowData, null, 2),
        }
      );

      if (response.ok) {
        alert("Fluxo publicado com sucesso!");
      } else {
        const error = await response.text();
        alert("Erro ao publicar fluxo: " + error);
      }
    } catch (err) {
      alert("Erro de conexão: " + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const addNodeTemplate = (template) => {
    const newNode = {
      id: (nodes.length + 1).toString(),
      type: "quadrado",
      position: {
        x: Math.random() * 250 + 100,
        y: Math.random() * 250 + 100,
      },
      data: {
        label: template.label,
        type: template.type,
        color: template.color,
        block: {
          ...template.block,
          defaultNext: "onError", // <- adiciona automaticamente
        },
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const downloadFlow = () => {
    const nodeIdMap = Object.fromEntries(
      nodes.map((n) => [n.id, n.data.label.replace(/\s+/g, "_").toLowerCase()])
    );

    const blocks = {};
    nodes.forEach((node) => {
      const id = nodeIdMap[node.id];
      const originalBlock = node.data.block;

      // Clona o bloco e substitui defaultNext com nome, se houver
      const clonedBlock = {
        ...originalBlock,
        defaultNext: originalBlock.defaultNext
          ? nodeIdMap[originalBlock.defaultNext] || originalBlock.defaultNext
          : undefined,
      };

      // Substitui também os "next" de cada action (se houver)
      if (originalBlock.actions && originalBlock.actions.length > 0) {
        clonedBlock.actions = originalBlock.actions.map((action) => ({
          next: nodeIdMap[action.next] || action.next,
          conditions: action.conditions || [],
        }));
      }

      blocks[id] = {
        ...clonedBlock,
        position: node.position, // <- salva posição
        color: node.data.color, // <- salva cor atual (opcional)
      };
    });

    const flowData = {
      start: nodeIdMap[nodes[0]?.id],
      blocks,
    };

    const blob = new Blob([JSON.stringify(flowData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "fluxo-chatbot.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const styledNodes = nodes.map((node) => ({
    ...node,
    id: node.id,
    data: {
      ...node.data,
      isSelected: selectedNode?.id === node.id,
      isHighlighted: node.id === highlightedNodeId,
      hasOutgoingHighlight: edges.some(
        (e) => e.source === node.id && highlightedNodeId === node.id
      ),
    },
  }));

  const styledEdges = edges.map((edge) => ({
    ...edge,
    markerEnd: {
      type: "arrowclosed",
      color: "#00e676",
      width: 16,
      height: 16,
    },
    style: {
      stroke: edge.id === selectedEdgeId ? "#00e676" : "#888",
      strokeWidth: edge.id === selectedEdgeId ? 2.5 : 1.5,
    },
  }));

  const iconButtonStyle = {
    background: "#333",
    color: "#fff",
    border: "1px solid #555",
    borderRadius: "50%",
    padding: "6px",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: "#121212",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: 10,
          transform: "translateY(-50%)",
          background: "#1e1e1e",
          border: "1px solid #444",
          borderRadius: "8px",
          padding: "0.5rem",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {/* AÇÕES NO TOPO */}
        <button
          onClick={handlePublish}
          title="Publicar"
          style={{
            ...iconButtonStyle,
            opacity: isPublishing ? 0.5 : 1,
            pointerEvents: isPublishing ? "none" : "auto",
          }}
        >
          {isPublishing ? "⏳" : <Rocket size={18} />}
        </button>

        <button
          onClick={downloadFlow}
          title="Baixar JSON"
          style={iconButtonStyle}
        >
          <Download size={18} />
        </button>

        {/* DIVISOR */}
        <div
          style={{
            width: "80%",
            height: "1px",
            backgroundColor: "#555",
            margin: "4px 0",
          }}
        />

        {/* TEMPLATES (de cima para baixo na ordem normal) */}
        {nodeTemplates.map((template) => (
          <button
            key={template.type + template.label}
            onClick={() => {
              addNodeTemplate(template);
              setShowTemplates(false);
            }}
            style={{
              ...iconButtonStyle,
              backgroundColor: template.color,
              width: "40px",
              height: "40px",
            }}
            title={template.label}
          >
            {iconMap[template.iconName] || <Zap size={16} />}
          </button>
        ))}
      </div>

      <ReactFlow
        key={selectedNode?.id || "no-selection"}
        nodes={styledNodes}
        edges={styledEdges}
        edgeTypes={{ default: undefined }} // ou deixe sem declarar edgeTypes
        nodeTypes={nodeTypes}
        onInit={(instance) => instance.setViewport({ x: 0, y: 0, zoom: 1.2 })}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeClick={(event, node) => {
          setSelectedNode(node);
          setSelectedEdgeId(null); // limpa a linha selecionada
          setHighlightedNodeId(node.id); // se ainda estiver usando para highlight visual
        }}
        onEdgeClick={(event, edge) => {
          event.stopPropagation();
          setSelectedEdgeId(edge.id);
          setSelectedNode(null); // desfoca o bloco
        }}
        onPaneClick={() => {
          setSelectedNode(null);
          setSelectedEdgeId(null); // limpa a linha
          setHighlightedNodeId(null); // limpa destaque
        }}
      >
        <Background color="#444" gap={16} />
        <Controls />
      </ReactFlow>

      <NodeConfigPanel
        selectedNode={selectedNode}
        onChange={updateSelectedNode}
        onClose={() => setSelectedNode(null)}
        allNodes={nodes}
        onConnect={(params) => {
          setEdges((eds) =>
            addEdge(
              {
                ...params,
                type: "default",
                markerEnd: {
                  type: "arrowclosed",
                  color: "#00e676",
                  width: 16,
                  height: 16,
                },
              },
              eds
            )
          );
        }}
      />
    </div>
  );
}

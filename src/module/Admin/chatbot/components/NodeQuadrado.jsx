import React from 'react';
import { Handle, Position } from 'reactflow';

export default function NodeQuadrado({ data }) {
  const borderColor = data.isHighlighted ? '#00e676' : data.color || '#777';

  return (
    <div
      className={data.isSelected ? 'selected-node' : ''}
      style={{
        width: '100px',
        height: '100px',
        background: '#1e1e1e',
        border: `2px solid ${borderColor}`,
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontSize: '13px',
        padding: '4px',
        position: 'relative',
        color: '#fff',
        transition: 'border 0.2s ease-in-out',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#888', visibility: 'hidden' }} />
      <div>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{data.label}</div>
        {data.type && (
          <span style={{
            fontSize: '10px',
            padding: '2px 4px',
            borderRadius: '4px',
            backgroundColor: data.color || '#444',
            color: '#fff',
          }}>
            {data.type}
          </span>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#888',
          opacity: data.isSelected ? 1 : 0,
          pointerEvents: data.isSelected ? 'auto' : 'none',
        }}
      />
    </div>
  );
}

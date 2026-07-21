import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Handle,
  Position,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MessageSquare, Send, Check, Settings, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

// Custom Nodes Design
const TriggerNode = ({ data, selected }) => (
  <div className={`glass-card p-4 rounded-xl border ${selected ? 'border-primary' : 'border-white/10'} w-[280px] shadow-lg transition-all`}>
    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/5">
      <div className="p-2 bg-primary/10 rounded-lg">
        <MessageSquare className="text-primary w-5 h-5" />
      </div>
      <div>
        <p className="text-[11px] font-semibold tracking-wider uppercase text-primary mb-0.5">Trigger</p>
        <h3 className="text-sm font-semibold text-on-surface">{data.label}</h3>
      </div>
    </div>
    <div className="text-sm text-on-surface-variant">
      {data.description || 'Configure trigger settings'}
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary border-none" />
  </div>
);

const ActionNode = ({ data, selected }) => (
  <div className={`glass-card p-4 rounded-xl border ${selected ? 'border-emerald-400' : 'border-white/10'} w-[280px] shadow-lg transition-all`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-emerald-400 border-none" />
    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/5">
      <div className="p-2 bg-emerald-400/10 rounded-lg">
        <Send className="text-emerald-400 w-5 h-5" />
      </div>
      <div>
        <p className="text-[11px] font-semibold tracking-wider uppercase text-emerald-400 mb-0.5">Action</p>
        <h3 className="text-sm font-semibold text-on-surface">{data.label}</h3>
      </div>
    </div>
    <div className="text-sm text-on-surface-variant">
      {data.description || 'Configure action settings'}
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-400 border-none" />
  </div>
);

const ConditionNode = ({ data, selected }) => (
  <div className={`glass-card p-4 rounded-xl border ${selected ? 'border-amber-400' : 'border-white/10'} w-[280px] shadow-lg transition-all`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-amber-400 border-none" />
    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/5">
      <div className="p-2 bg-amber-400/10 rounded-lg">
        <Check className="text-amber-400 w-5 h-5" />
      </div>
      <div>
        <p className="text-[11px] font-semibold tracking-wider uppercase text-amber-400 mb-0.5">Condition</p>
        <h3 className="text-sm font-semibold text-on-surface">{data.label}</h3>
      </div>
    </div>
    <div className="text-sm text-on-surface-variant">
      {data.description || 'Configure condition'}
    </div>
    <Handle type="source" position={Position.Bottom} id="true" className="w-3 h-3 bg-emerald-400 border-none !left-[30%]" />
    <Handle type="source" position={Position.Bottom} id="false" className="w-3 h-3 bg-red-400 border-none !left-[70%]" />
  </div>
);

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
};

let id = 1;
const getId = () => `node_${id++}`;

const SidebarPalette = () => {
  const onDragStart = (event, nodeType, label, description) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label);
    event.dataTransfer.setData('application/reactflow-desc', description);
    event.dataTransfer.effectAllowed = 'move';
  };

  const blocks = [
    { type: 'trigger', label: 'Post Comment', desc: 'When someone comments on a post' },
    { type: 'trigger', label: 'DM Keyword', desc: 'When someone DMs you a keyword' },
    { type: 'trigger', label: 'Story Reply', desc: 'When someone replies to your story' },
    { type: 'trigger', label: 'Ice Breaker', desc: 'When someone taps an Ice Breaker' },
    { type: 'action', label: 'Send DM', desc: 'Send a direct message' },
    { type: 'action', label: 'Reply to Comment', desc: 'Publicly reply to a comment' },
    { type: 'condition', label: 'Require Follow', desc: 'Check if user is following' },
  ];

  return (
    <aside className="w-64 glass-card border-r border-white/5 p-4 flex flex-col h-full z-10">
      <h2 className="text-sm font-semibold mb-4 text-on-surface-variant uppercase tracking-wider">Nodes</h2>
      <div className="space-y-3 flex-1 overflow-y-auto pr-2">
        {blocks.map((block, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg border border-white/10 cursor-grab hover:border-white/20 transition-colors ${
              block.type === 'trigger' ? 'hover:bg-primary/5' : 
              block.type === 'action' ? 'hover:bg-emerald-400/5' : 'hover:bg-amber-400/5'
            }`}
            onDragStart={(event) => onDragStart(event, block.type, block.label, block.desc)}
            draggable
          >
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
              block.type === 'trigger' ? 'text-primary' : 
              block.type === 'action' ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {block.type}
            </p>
            <p className="text-sm font-medium">{block.label}</p>
          </div>
        ))}
      </div>
    </aside>
  );
};

const PropertiesPanel = ({ node, setNodes, posts = [] }) => {
  if (!node) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === node.id) {
          n.data = { ...n.data, [name]: value };
        }
        return n;
      })
    );
  };

  const displayedPosts = posts.slice(0, 3);

  return (
    <aside className="w-80 glass-card border-l border-white/5 p-6 flex flex-col h-full z-10 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Settings size={18} className="text-on-surface-variant" />
          Settings
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
            Label
          </label>
          <input
            name="label"
            value={node.data.label || ''}
            onChange={handleChange}
            className="w-full bg-surface/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
            Description
          </label>
          <input
            name="description"
            value={node.data.description || ''}
            onChange={handleChange}
            className="w-full bg-surface/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {node.type === 'trigger' && (
          <div className="space-y-4 border-t border-white/10 pt-4 mt-4">
            <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Trigger Configuration</h3>
            
            {(node.data.label === 'Post Comment' || node.data.label === 'Story Reply') && (
              <div className="space-y-2 mb-4">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Target</label>
                <select
                  name="target_type"
                  value={node.data.target_type || 'any'}
                  onChange={handleChange}
                  className="w-full bg-surface/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="any">Any {node.data.label === 'Post Comment' ? 'Post/Reel' : 'Story'}</option>
                  <option value="specific">Specific {node.data.label === 'Post Comment' ? 'Post/Reel' : 'Story'}</option>
                  {node.data.label === 'Post Comment' && <option value="next">Next Post/Reel</option>}
                </select>
              </div>
            )}

            {node.data.target_type === 'specific' && (
              <div className="mb-4">
                 <p className="text-xs text-on-surface-variant mb-2">Select {node.data.label === 'Post Comment' ? 'post' : 'story'}:</p>
                 <div className="grid grid-cols-3 gap-2">
                   {displayedPosts.map(post => {
                     const isSelected = node.data.target_media_id === post.id;
                     return (
                       <div 
                         key={post.id}
                         onClick={() => setNodes(nds => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, target_media_id: post.id } } : n))}
                         className={`aspect-[3/4] rounded-lg overflow-hidden cursor-pointer relative border-2 ${isSelected ? 'border-primary' : 'border-transparent'}`}
                       >
                         {post.thumbnail_url || post.media_url ? (
                           <img src={post.thumbnail_url || post.media_url} className="w-full h-full object-cover" alt="post" />
                         ) : (
                           <div className="w-full h-full bg-surface-variant flex items-center justify-center"><ImageIcon size={16} className="text-white/40" /></div>
                         )}
                         {isSelected && (
                           <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                             <Check size={10} className="text-black" />
                           </div>
                         )}
                       </div>
                     )
                   })}
                 </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                Match Type
              </label>
              <select
                name="match_type"
                value={node.data.match_type || 'any'}
                onChange={handleChange}
                className="w-full bg-surface/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors mb-3"
              >
                <option value="any">Any word</option>
                <option value="exact">Message is exactly</option>
                <option value="partial">Message contains</option>
              </select>
              
              {node.data.match_type !== 'any' && (
                <input
                  name="keyword"
                  placeholder="e.g. LINK"
                  value={node.data.keyword || ''}
                  onChange={handleChange}
                  className="w-full bg-surface/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              )}
            </div>
          </div>
        )}

        {node.type === 'action' && (
          <div className="space-y-4 border-t border-white/10 pt-4 mt-4">
            <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Action Configuration</h3>
            
            {(node.data.label === 'Send DM' || !node.data.label) && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    placeholder="Enter your message..."
                    rows={4}
                    value={node.data.message || ''}
                    onChange={handleChange}
                    className="w-full bg-surface/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>
                <div>
                   <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Button Text (Optional)</label>
                   <input
                     name="button_text"
                     value={node.data.button_text || ''}
                     onChange={handleChange}
                     className="w-full bg-surface/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                   />
                </div>
              </>
            )}
            
            {node.data.label === 'Reply to Comment' && (
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  Public Reply Text
                </label>
                <textarea
                  name="public_reply_text"
                  placeholder="Thanks for your comment! I've sent you a DM 📩"
                  rows={4}
                  value={node.data.public_reply_text || ''}
                  onChange={handleChange}
                  className="w-full bg-surface/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

const FlowEditor = ({ posts }) => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: 'rgba(255,255,255,0.4)', strokeWidth: 2 } }, eds)),
    []
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/reactflow-label');
      const desc = event.dataTransfer.getData('application/reactflow-desc');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label, description: desc },
      };

      setNodes((nds) => nds.concat(newNode));
      setSelectedNode(newNode);
    },
    [reactFlowInstance]
  );

  const onNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
  };

  // Sync selected node with latest nodes state
  React.useEffect(() => {
    if (selectedNode) {
      const updatedNode = nodes.find(n => n.id === selectedNode.id);
      if (updatedNode) {
        setSelectedNode(updatedNode);
      } else {
        setSelectedNode(null);
      }
    }
  }, [nodes]);

  return (
    <div className="flex h-[calc(100vh-140px)] w-full relative bg-[#0B0F19] rounded-2xl overflow-hidden border border-white/5">
      <ReactFlowProvider>
        <SidebarPalette />
        <div className="flex-1 h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-[#0B0F19]"
            defaultEdgeOptions={{
              type: 'smoothstep',
              markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(255,255,255,0.4)' },
            }}
          >
            <Background color="rgba(255, 255, 255, 0.05)" gap={24} size={1} />
            <Controls className="!bg-surface !border-white/10 !fill-white" />
          </ReactFlow>
        </div>
        {selectedNode && (
          <PropertiesPanel node={selectedNode} setNodes={setNodes} posts={posts} />
        )}
      </ReactFlowProvider>
    </div>
  );
};

export default function VisualAutomationEditor() {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/media`);
        setPosts(res.data.data || []);
      } catch (error) {
        console.error('Failed to fetch media', error);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="max-w-[1440px] mx-auto pb-12 h-full">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-[32px] leading-tight font-semibold text-on-surface mb-2 font-['Plus_Jakarta_Sans'] tracking-tight">Visual Builder</h2>
          <p className="text-on-surface-variant text-[16px]">Drag and drop to map out your automation workflows.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 rounded-lg bg-surface border border-white/10 text-on-surface font-medium hover:bg-surface-variant transition-colors">
            Discard
          </button>
          <button className="px-6 py-2.5 rounded-lg electric-gradient text-white font-medium hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(112,0,255,0.3)]">
            Save Automation
          </button>
        </div>
      </header>

      <FlowEditor posts={posts} />
    </div>
  );
}

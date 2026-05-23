import React, { useRef, useState, useEffect } from 'react';
import api from '../utils/api';
import Spinner from './Spinner';
import toast from 'react-hot-toast';

import {
  Pencil,
  Eraser,
  RotateCcw,
  Trash2,
  Save,
  CloudLightning,
  CloudCog,
} from 'lucide-react';

const TabWhiteboard = ({ courseId }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved');

  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#8b5cf6');
  const [lineWidth, setLineWidth] = useState(6);

  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState(null);

  const presetColors = [
    '#8b5cf6',
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#ec4899',
    '#000000',
    '#ffffff',
  ];

  // Load whiteboard data
  useEffect(() => {
    const fetchWhiteboard = async () => {
      try {
        setLoading(true);

        const response = await api.get(`/whiteboard/${courseId}`);

        if (response.data?.canvasJSON) {
          const parsed = JSON.parse(response.data.canvasJSON);
          setStrokes(parsed);
        } else {
          setStrokes([]);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load whiteboard');
      } finally {
        setLoading(false);
      }
    };

    fetchWhiteboard();
  }, [courseId]);

  // Setup canvas
  useEffect(() => {
    if (loading) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const context = canvas.getContext('2d');

    context.scale(2, 2);

    context.lineCap = 'round';
    context.lineJoin = 'round';

    contextRef.current = context;

    redrawStrokes(strokes);
  }, [loading]);

  // Redraw all strokes
  const redrawStrokes = (strokeList) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;

    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    strokeList.forEach((stroke) => {
      if (!stroke.points || stroke.points.length === 0) return;

      context.beginPath();

      if (stroke.tool === 'eraser') {
        context.globalCompositeOperation = 'destination-out';
        context.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        context.globalCompositeOperation = 'source-over';
        context.strokeStyle = stroke.color;
      }

      context.lineWidth = stroke.lineWidth;

      const firstPoint = stroke.points[0];

      context.moveTo(firstPoint.x, firstPoint.y);

      for (let i = 1; i < stroke.points.length; i++) {
        const point = stroke.points[i];
        context.lineTo(point.x, point.y);
      }

      context.stroke();
    });

    context.globalCompositeOperation = 'source-over';
  };

  // Save to backend
  const saveWhiteboardState = async (updatedStrokes) => {
    try {
      setSaveStatus('saving');

      await api.post(`/whiteboard/${courseId}`, {
        canvasJSON: JSON.stringify(updatedStrokes),
      });

      setSaveStatus('saved');
    } catch (error) {
      console.error(error);
      setSaveStatus('error');
      toast.error('Failed to save drawing');
    }
  };

  // Coordinates
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;

    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches
      ? e.touches[0].clientX
      : e.clientX;

    const clientY = e.touches
      ? e.touches[0].clientY
      : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Start drawing
  const startDrawing = (e) => {
    e.preventDefault();

    const coord = getCoordinates(e);

    const context = contextRef.current;

    if (!context) return;

    context.beginPath();

    if (tool === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
      context.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      context.globalCompositeOperation = 'source-over';
      context.strokeStyle = color;
    }

    context.lineWidth = lineWidth;

    context.moveTo(coord.x, coord.y);

    setIsDrawing(true);

    setCurrentStroke({
      tool,
      color,
      lineWidth,
      points: [coord],
    });
  };

  // Draw
  const draw = (e) => {
    if (!isDrawing || !currentStroke) return;

    e.preventDefault();

    const coord = getCoordinates(e);

    const context = contextRef.current;

    if (!context) return;

    context.lineTo(coord.x, coord.y);

    context.stroke();

    setCurrentStroke((prev) => ({
      ...prev,
      points: [...prev.points, coord],
    }));
  };

  // Stop drawing
  const stopDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);

    if (currentStroke) {
      const updatedStrokes = [...strokes, currentStroke];

      setStrokes(updatedStrokes);

      saveWhiteboardState(updatedStrokes);

      setCurrentStroke(null);
    }
  };

  // Undo
  const handleUndo = () => {
    if (strokes.length === 0) return;

    const updated = strokes.slice(0, -1);

    setStrokes(updated);

    redrawStrokes(updated);

    saveWhiteboardState(updated);
  };

  // Clear
  const handleClear = () => {
    const empty = [];

    setStrokes(empty);

    redrawStrokes(empty);

    saveWhiteboardState(empty);

    toast.success('Whiteboard cleared');
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-4">

        {/* Pen */}
        <button
          onClick={() => setTool('pen')}
          className={`p-2 rounded-xl border ${
            tool === 'pen'
              ? 'bg-violet-100'
              : 'bg-white'
          }`}
        >
          <Pencil size={18} />
        </button>

        {/* Eraser */}
        <button
          onClick={() => setTool('eraser')}
          className={`p-2 rounded-xl border ${
            tool === 'eraser'
              ? 'bg-violet-100'
              : 'bg-white'
          }`}
        >
          <Eraser size={18} />
        </button>

        {/* Colors */}
        <div className="flex items-center gap-2">
          {presetColors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="h-6 w-6 rounded-full border"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Undo */}
        <button
          onClick={handleUndo}
          className="p-2 rounded-xl border"
        >
          <RotateCcw size={18} />
        </button>

        {/* Clear */}
        <button
          onClick={handleClear}
          className="p-2 rounded-xl border text-red-500"
        >
          <Trash2 size={18} />
        </button>

        {/* Save */}
        <button
          onClick={() => saveWhiteboardState(strokes)}
          className="p-2 rounded-xl bg-violet-500 text-white"
        >
          <Save size={18} />
        </button>

        {/* Save status */}
        <div className="ml-auto flex items-center gap-2 text-sm">
          {saveStatus === 'saving' ? (
            <>
              <CloudLightning size={16} />
              Saving...
            </>
          ) : saveStatus === 'saved' ? (
            <>
              <CloudCog size={16} />
              Saved
            </>
          ) : (
            <>
              <CloudLightning size={16} />
              Error
            </>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative h-[500px] overflow-hidden rounded-2xl border bg-white">

        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none cursor-crosshair"

          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}

          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  );
};

export default TabWhiteboard;
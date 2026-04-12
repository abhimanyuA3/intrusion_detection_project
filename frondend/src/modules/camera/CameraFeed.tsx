import { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, VideoOff, AlertTriangle, Loader2 } from 'lucide-react';
import { useMode } from '@/context/ModeContext';
import { Button } from '@/components/ui/button';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { usePiSensor } from '@/hooks/usePiSensor';

export function CameraFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  const { getEffectiveMode } = useMode();
  const mode = getEffectiveMode('camera');
  const { status: piStatus, error: piError, isRealMode } = usePiSensor('camera');
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Model states
  const [model, setModel] = useState<cocossd.ObjectDetection | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [intruderDetected, setIntruderDetected] = useState(false);

  // Load model once on component mount
  useEffect(() => {
    let isMounted = true;
    const loadModel = async () => {
      try {
        setIsModelLoading(true);
        await tf.ready();
        const loadedModel = await cocossd.load();
        if (isMounted) {
          setModel(loadedModel);
        }
      } catch (err) {
        console.error("Failed to load model:", err);
        if (isMounted) setError("Failed to load person detection model");
      } finally {
        if (isMounted) setIsModelLoading(false);
      }
    };
    loadModel();
    
    return () => {
      isMounted = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const stopWebcam = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIntruderDetected(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    
    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  const detectFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !model || !isStreaming) return;
    const video = videoRef.current;
    
    // Check if video is ready
    if (video.readyState === 4 && video.videoWidth > 0) {
      // Sync canvas dimensions to video
      if (canvasRef.current.width !== video.videoWidth) {
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
      }
      
      try {
        const predictions = await model.detect(video);
        const ctx = canvasRef.current.getContext('2d');
        
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          let foundPerson = false;
          
          predictions.forEach(prediction => {
            if (prediction.class === 'person') {
              foundPerson = true;
              
              // Draw bounding box
              const [x, y, width, height] = prediction.bbox;
              ctx.strokeStyle = '#ef4444'; // red-500
              ctx.lineWidth = 4;
              ctx.strokeRect(x, y, width, height);

              // Draw label background
              ctx.fillStyle = '#ef4444';
              const textWidth = ctx.measureText(`INTRUDER (${Math.round(prediction.score * 100)}%)`).width;
              ctx.fillRect(x, y - 24, textWidth + 10, 24);

              // Draw label text
              ctx.fillStyle = '#ffffff';
              ctx.font = '14px monospace';
              ctx.fillText(
                `INTRUDER (${Math.round(prediction.score * 100)}%)`,
                x + 5,
                y - 8
              );
            }
          });
          
          setIntruderDetected(foundPerson);
        }
      } catch (err) {
        // Handle potential WebGL context loss or detection framing errors silently
        console.warn("Detection frame error:", err);
      }
    }
    
    requestRef.current = requestAnimationFrame(detectFrame);
  }, [model, isStreaming]);

  // Start detection loop when streaming and model are ready
  useEffect(() => {
    if (isStreaming && model) {
      requestRef.current = requestAnimationFrame(detectFrame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isStreaming, model, detectFrame]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError(null);
      }
    } catch {
      setError('Camera access denied or unavailable');
    }
  };

  useEffect(() => {
    return () => stopWebcam();
  }, [stopWebcam]);

  if (mode === 'real') {
    const isIntruding = piStatus.human_detected;
    return (
      <div className={`glass-panel rounded-lg overflow-hidden transition-all duration-300 ${isIntruding ? 'border-destructive/80 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : ''}`}>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className={`h-4 w-4 ${isIntruding ? 'text-destructive' : 'text-primary'}`} />
            <h3 className={`font-mono text-xs uppercase tracking-wider ${isIntruding ? 'text-destructive font-bold' : 'text-primary'}`}>
              Pi Live Stream
            </h3>
            {isIntruding && (
              <span className="flex items-center gap-1 text-xs text-destructive ml-2 bg-destructive/10 px-2 py-0.5 rounded animate-pulse">
                <AlertTriangle className="h-3 w-3" />
                INTRUDER
              </span>
            )}
          </div>
          {piError ? (
            <span className="text-xs text-destructive">{piError}</span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-success">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Connected
            </span>
          )}
        </div>
        
        <div className="relative aspect-video bg-background overflow-hidden flex flex-col items-center justify-center">
          {piError ? (
            <div className="flex flex-col items-center gap-2">
              <VideoOff className="h-10 w-10 text-muted-foreground" />
              <p className="font-mono text-xs text-muted-foreground">Hardware Not Connected</p>
            </div>
          ) : (
            <img 
              src={`${import.meta.env.VITE_PI_HOST || 'http://localhost:5000'}/video_feed`}
              className="absolute inset-0 w-full h-full object-cover"
              alt="Raspberry Pi Stream"
            />
          )}
          {!piError && <div className="absolute inset-0 scanline pointer-events-none z-30 opacity-50" />}
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-panel rounded-lg overflow-hidden transition-all duration-300 ${intruderDetected ? 'border-destructive/80 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : ''}`}>
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className={`h-4 w-4 ${intruderDetected ? 'text-destructive' : 'text-primary'}`} />
          <h3 className={`font-mono text-xs uppercase tracking-wider ${intruderDetected ? 'text-destructive font-bold' : 'text-primary'}`}>
            Live Feed — Demo
          </h3>
          {isModelLoading && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading Model...
            </span>
          )}
          {intruderDetected && (
            <span className="flex items-center gap-1 text-xs text-destructive ml-2 bg-destructive/10 px-2 py-0.5 rounded animate-pulse">
              <AlertTriangle className="h-3 w-3" />
              INTRUDER
            </span>
          )}
        </div>
        <Button
          variant={isStreaming ? "destructive" : "outline"}
          size="sm"
          onClick={isStreaming ? stopWebcam : startWebcam}
          className="text-xs font-mono h-8"
          disabled={isModelLoading}
        >
          {isStreaming ? 'Stop' : 'Start Webcam'}
        </Button>
      </div>

      <div className="relative aspect-video bg-background overflow-hidden relative">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <p className="text-xs text-destructive font-mono">{error}</p>
          </div>
        )}
        {!isStreaming && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-20">
            <Camera className="h-8 w-8 text-muted-foreground" />
            <p className="text-xs text-muted-foreground font-mono">Click "Start Webcam" to begin</p>
          </div>
        )}
        
        {/* Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${isStreaming ? 'opacity-100' : 'opacity-0'}`}
        />
        
        {/* Canvas for bounding boxes */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none z-10 ${isStreaming ? 'block' : 'hidden'}`}
        />
        
        {isStreaming && <div className="absolute inset-0 scanline pointer-events-none z-30 opacity-50" />}
      </div>
    </div>
  );
}

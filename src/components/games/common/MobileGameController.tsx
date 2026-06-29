import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface MobileGameControllerProps {
  // Directional handlers (-1, 0, 1) or specific directions
  onDirX?: (dir: number) => void;
  onDirY?: (dir: number) => void;
  onUp?: (active: boolean) => void;
  onDown?: (active: boolean) => void;
  onLeft?: (active: boolean) => void;
  onRight?: (active: boolean) => void;
  
  // Action buttons
  actionA?: {
    icon?: React.ReactNode;
    label?: string;
    onPress: (active: boolean) => void;
    colorClass?: string;
  };
  actionB?: {
    icon?: React.ReactNode;
    label?: string;
    onPress: (active: boolean) => void;
    colorClass?: string;
  };
  
  // Custom D-Pad configuration
  showDPad?: boolean;
  dPadConfig?: {
    up?: boolean;
    down?: boolean;
    left?: boolean;
    right?: boolean;
  };
  className?: string;
}

const DPadButton = ({ 
  active, 
  onAction, 
  icon 
}: { 
  active: boolean, 
  onAction: (a: boolean) => void, 
  icon: React.ReactNode 
}) => {
  if (!active) return <div className="w-14 h-14" />; // empty space
  return (
    <button 
      className="bg-white/10 w-14 h-14 rounded-full flex items-center justify-center active:bg-white/30 touch-none select-none transition-colors shadow-lg border border-white/5"
      onPointerDown={(e) => { e.preventDefault(); onAction(true); }}
      onPointerUp={(e) => { e.preventDefault(); onAction(false); }}
      onPointerLeave={(e) => { e.preventDefault(); onAction(false); }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {icon}
    </button>
  );
};

const ActionButton = ({ config }: { config: NonNullable<MobileGameControllerProps['actionA']> }) => {
  const defaultColor = "bg-red-500/80 active:bg-red-500 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]";
  const colorClass = config.colorClass || defaultColor;
  
  return (
    <button 
      className={`${colorClass} w-16 h-16 rounded-full flex items-center justify-center touch-none select-none border-2 transition-transform active:scale-95`}
      onPointerDown={(e) => { e.preventDefault(); config.onPress(true); }}
      onPointerUp={(e) => { e.preventDefault(); config.onPress(false); }}
      onPointerLeave={(e) => { e.preventDefault(); config.onPress(false); }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {config.icon ? config.icon : <span className="text-white font-bold text-xl">{config.label || 'A'}</span>}
    </button>
  );
};

export const MobileGameController: React.FC<MobileGameControllerProps> = ({
  onDirX,
  onDirY,
  onUp,
  onDown,
  onLeft,
  onRight,
  actionA,
  actionB,
  showDPad = true,
  dPadConfig = { up: true, down: true, left: true, right: true },
  className
}) => {
  const handleUp = (active: boolean) => {
    if (onUp) onUp(active);
    if (onDirY) onDirY(active ? -1 : 0);
  };
  
  const handleDown = (active: boolean) => {
    if (onDown) onDown(active);
    if (onDirY) onDirY(active ? 1 : 0);
  };
  
  const handleLeft = (active: boolean) => {
    if (onLeft) onLeft(active);
    if (onDirX) onDirX(active ? -1 : 0);
  };
  
  const handleRight = (active: boolean) => {
    if (onRight) onRight(active);
    if (onDirX) onDirX(active ? 1 : 0);
  };

  return (
    <div className={className || "w-full max-w-[800px] mt-4 flex justify-between px-4 sm:hidden z-50"}>
      {/* D-Pad */}
      <div className="flex items-center gap-1">
        {showDPad && (
          <div className="grid grid-cols-3 grid-rows-3 gap-1">
            <div />
            <DPadButton active={!!dPadConfig.up} onAction={handleUp} icon={<ArrowUp className="w-8 h-8 text-white" />} />
            <div />
            
            <DPadButton active={!!dPadConfig.left} onAction={handleLeft} icon={<ArrowLeft className="w-8 h-8 text-white" />} />
            <div className="w-14 h-14 flex items-center justify-center"><div className="w-4 h-4 rounded-full bg-white/10" /></div>
            <DPadButton active={!!dPadConfig.right} onAction={handleRight} icon={<ArrowRight className="w-8 h-8 text-white" />} />
            
            <div />
            <DPadButton active={!!dPadConfig.down} onAction={handleDown} icon={<ArrowDown className="w-8 h-8 text-white" />} />
            <div />
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-end gap-4 pb-4 pr-2">
        {actionB && <ActionButton config={actionB} />}
        {actionA && <ActionButton config={actionA} />}
      </div>
    </div>
  );
};

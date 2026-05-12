import { useState, useEffect } from 'react';
import './EntranceAnimation.css';

function EntranceAnimation({ onAnimationComplete }) {
  const [stage, setStage] = useState(1);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(2), 1200);
    const timer2 = setTimeout(() => setStage(3), 3000);
    const timer3 = setTimeout(() => setStage(4), 5200);
    const timer4 = setTimeout(() => setStage(5), 7500);
    const timer5 = setTimeout(() => setStage(6), 10000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, []);

  useEffect(() => {
    if (stage === 6) {
      onAnimationComplete();
    }
  }, [stage, onAnimationComplete]);

  // Reusable realistic ring component
  const RealisticRing = ({ small = false }) => (
    <div className={`ring-3d ${small ? 'ring-3d-small' : ''}`}>
      <div className="ring-outer" />
      <div className="ring-face" />
      <div className="ring-inner-hole" />
      <div className="ring-top-shine" />
      <div className="ring-top-shine-2" />
      <div className="ring-side-shine" />
      <div className="ring-bottom-shine" />
      {!small && <div className="ring-reflection" />}
    </div>
  );

  // Reusable realistic box component
  const OpenBox = ({ static: isStatic = false }) => (
    <div className="box-open-wrapper">
      {isStatic ? (
        <div className="box-open-lid-static">
          <div className="box-lid-inner-shine" />
          <div className="box-lid-top-shine" />
        </div>
      ) : (
        <div className="box-open-lid animate-lidOpen">
          <div className="box-lid-inner-shine" />
          <div className="box-lid-top-shine" />
        </div>
      )}
      <div className="box-open-base">
        <div className="box-base-shine" />
        <div className="box-cushion">
          <div className="box-cushion-fold">
            <div className="box-cushion-slot" />
            <div className="box-cushion-shine" />
          </div>
          <div className="box-cushion-bottom" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="entrance-wrapper">
      <div className="spotlight-beam" />

      {/* Stage 1 — Closed box appears */}
      {stage === 1 && (
        <div className="animate-boxAppear">
          <div className="box-closed">
            <div className="box-closed-lid">
              <div className="box-closed-lid-top-shine" />
              <div className="box-closed-lid-side-shine" />
            </div>
            <div className="box-closed-base" />
            <div className="box-hinge" />
          </div>
        </div>
      )}

      {/* Stage 2 — Lid opens */}
      {stage === 2 && (
        <div className="relative">
          <OpenBox static={false} />
        </div>
      )}

      {/* Stage 3 — Ring rises out of box */}
      {stage === 3 && (
        <div className="relative flex items-center justify-center">
          <OpenBox static={true} />
          <div className="ring-rise-container animate-ringRise">
            <RealisticRing />
          </div>
        </div>
      )}

      {/* Stage 4 — Ring falls */}
      {stage === 4 && (
        <div className="relative w-full h-screen">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <OpenBox static={true} />
          </div>
          <div
            className="absolute left-1/2 -translate-x-1/2 animate-ringFall"
            style={{ top: '30%' }}
          >
            <RealisticRing small />
          </div>
        </div>
      )}

      {/* Stage 5 — Curtains reveal */}
      {stage === 5 && (
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
            <OpenBox static={true} />
          </div>
          <div className="absolute inset-0 bg-black z-40" />
          <div className="absolute top-0 left-0 w-1/2 h-full z-50 curtain-left">
            <div className="w-full h-full curtain-panel curtain-panel-left">
              <div className="curtain-edge curtain-edge-right" />
              <div className="curtain-sheen" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full z-50 curtain-right">
            <div className="w-full h-full curtain-panel curtain-panel-right">
              <div className="curtain-edge curtain-edge-left" />
              <div className="curtain-sheen curtain-sheen-right" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EntranceAnimation;
import React, { useState, useEffect } from 'react';
import Xarrow from "react-xarrows";

const Sticker = (props) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
        <div
            id='sticker'
            onMouseDown={() => props.abortArrow()}
            style={{
            position: 'fixed',
            top: position.y,
            left: position.x,
            transform: 'translate(-50%, -50%)',
            background: 'transparent',
            padding: '10px',
            borderRadius: '5px',
            cursor: 'pointer',
            zIndex: 10000,
          }}
        />
        <Xarrow
            start={String(props.start)}
            end="sticker"
            zIndex={1000}
            color="rgb(100,100,100)"
            curveness={0.5}
            strokeWidth={3}
        />
    </>
  );
};

export default Sticker;
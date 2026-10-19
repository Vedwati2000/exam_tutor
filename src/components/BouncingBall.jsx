import React from 'react';

const BouncingBall = ({ color = '#f77f00' }) => {
  return (
    <div className="ball-track" style={{ width: '40px' }}>
      <div
        className="bouncing-ball"
        style={{
          background: `radial-gradient(circle at 30% 30%, #ffd93d, ${color})`,
          left: '10px'
        }}
      />
      <div className="ball-shadow" style={{ left: '10px' }} />
    </div>
  );
};

export default BouncingBall;
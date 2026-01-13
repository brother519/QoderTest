import './PauseMenu.css';

export function PauseMenu() {
  return (
    <div className="pause-overlay">
      <div className="pause-content">
        <h1>PAUSED</h1>
        <p>Press P to Resume</p>
      </div>
    </div>
  );
}
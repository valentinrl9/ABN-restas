export default function NumPad({ onInput, onDelete, onSubmit }) {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="numpad">
      {/* Números 1–9 */}
      {nums.map(n => (
        <button
          key={n}
          className="numpad-btn"
          onClick={() => onInput(n)}
        >
          {n}
        </button>
      ))}

      {/* Borrar */}
      <button className="numpad-btn special" onClick={onDelete}>
        ←
      </button>

      {/* Cero */}
      <button className="numpad-btn" onClick={() => onInput(0)}>
        0
      </button>

      {/* OK */}
      <button className="numpad-btn ok" onClick={onSubmit}>
        OK
      </button>
    </div>
  );
}

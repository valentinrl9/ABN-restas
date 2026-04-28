import { useState } from "react";
import ABNTable from "./components/ABNTable";
import NumPad from "./components/NumPad";
import confetti from "canvas-confetti";
import "./index.css";

function generateNumber(level) {
  switch (level) {
    case 1: return Math.floor(Math.random() * 20) + 1;
    case 2: return Math.floor(Math.random() * 30) + 20;
    case 3: return Math.floor(Math.random() * 50) + 50;
    case 4: return Math.floor(Math.random() * 400) + 100;
    case 5: return Math.floor(Math.random() * 500) + 500;
    default: return 10;
  }
}

function generateOperation(level) {
  const a = generateNumber(level);
  const b = generateNumber(level);
  const big = Math.max(a, b);
  const small = Math.min(a, b);
  return { a: big, b: small, op: "-" }; 
}  

function createRowsForOperation(op) {
  const big = Math.max(op.a, op.b).toString();
  const small = Math.min(op.a, op.b).toString();
  return [
    { move: "", first: big, second: small },
    { move: "", first: "", second: "" }
  ];
}

export default function App() {
  const [difficulty, setDifficulty] = useState(1);
  const [operation, setOperation] = useState(() => generateOperation(1));
  const [rows, setRows] = useState(() => createRowsForOperation(generateOperation(1)));
  const [completed, setCompleted] = useState(false);

  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [activeField, setActiveField] = useState([1, "move"]);

  // NUEVOS ESTADOS PARA LOS MODALES
  const [showInfo, setShowInfo] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const showError = (msg) => {
    setModalMessage(msg);
    setShowModal(true);
  };

  const isValidMove = (move, prevFirst, prevSecond) => {
  const m = parseInt(move);
    if (isNaN(m) || m <= 0) return false;
    const smaller = Math.min(parseInt(prevFirst), parseInt(prevSecond));
    return m <= smaller;
  };

  const validateField = (rowIndex, field, rowsCopy) => {
    if (rowIndex === 0) return false;

    const prev = rowsCopy[rowIndex - 1];
    const curr = rowsCopy[rowIndex];

    const move = parseInt(curr.move);
    const first = parseInt(curr.first);
    const second = parseInt(curr.second);

    if (field === "move") {
      curr.valid = isValidMove(curr.move, prev.first, prev.second);

      if (!curr.valid) {
        showError(
          `El movimiento no puede ser mayor que el número menor: ${Math.min(
            prev.first,
            prev.second
          )}.`
        );
        return true;
      }
    }

    if (field === "first") {
      // CAMBIO: Ahora restamos el movimiento del primer número
      const expectedFirst = parseInt(prev.first) - move;
      curr.firstValid = first === expectedFirst;

      if (!curr.firstValid) {
        showError(
          `Restamos al número anterior lo que movemos: ${prev.first} - ${move} = ?`
        );
        return true;
      }
    }

    if (field === "second") {
      // Este se queda igual (ya restaba), pero ajustamos el mensaje por coherencia
      const expectedSecond = parseInt(prev.second) - move;
      curr.secondValid = second === expectedSecond;

      if (!curr.secondValid) {
        showError(
          `Restamos al sustraendo lo que movemos: ${prev.second} - ${move} = ?`
        );
        return true;
      }
    }

    return false;
  };

  const isRowComplete = (row, index) => {
    if (index === 0) return true;

    return (
      row.move !== "" &&
      row.first !== "" &&
      row.second !== "" &&
      row.valid === true &&
      row.firstValid === true &&
      row.secondValid === true
    );
  };

  const handleNumPadInput = (num) => {
    if (!activeField || completed) return;

    const [rowIndex, field] = activeField;
    if (rowIndex === 0) return;

    const newRows = [...rows];
    newRows[rowIndex][field] = (newRows[rowIndex][field] || "") + num;
    setRows(newRows);
  };

  const handleDelete = () => {
    if (!activeField || completed) return;

    const [rowIndex, field] = activeField;
    if (rowIndex === 0) return;

    const newRows = [...rows];
    newRows[rowIndex][field] = (newRows[rowIndex][field] || "").slice(0, -1);
    setRows(newRows);
  };

  const addRow = () => {
    if (completed) return;

    const lastRow = rows[rows.length - 1];
    if (!isRowComplete(lastRow, rows.length - 1)) return;

    const newRows = [...rows, { move: "", first: "", second: "" }];
    setRows(newRows);

    const newIndex = newRows.length - 1;
    setActiveField([newIndex, "move"]);
  };

  const handleSubmit = () => {
    if (!activeField || completed) return;

    const [rowIndex, field] = activeField;
    const newRows = [...rows];

    const error = validateField(rowIndex, field, newRows);
    setRows(newRows);

    if (error) return;

    if (field === "move") {
      setActiveField([rowIndex, "first"]);
      return;
    }

    if (field === "first") {
      setActiveField([rowIndex, "second"]);
      return;
    }

    if (field === "second") {
      if (!isRowComplete(newRows[rowIndex], rowIndex)) return;

      if (
        (newRows[rowIndex].first === "0" || newRows[rowIndex].second === "0") &&
        newRows[rowIndex].firstValid &&
        newRows[rowIndex].secondValid
      ) {
        setCompleted(true);

        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 }
            });
          }, i * 1000);
        }

        return;
      }

      if (rowIndex === rows.length - 1) {
        addRow();
      } else {
        setActiveField([rowIndex + 1, "move"]);
      }
    }
  };

  const resetStateForOperation = (op) => {
    setOperation(op);
    setRows(createRowsForOperation(op));
    setActiveField([1, "move"]);
    setCompleted(false);
    setModalMessage("");
    setShowModal(false);
  };

  const restartProblem = () => {
    resetStateForOperation(operation);
  };

  const newProblem = () => {
    changeDifficulty(difficulty);
  };

  const changeDifficulty = (level) => {
    setDifficulty(level);
    const newOp = generateOperation(level);
    resetStateForOperation(newOp);
  };

  return (
    <div className="app-wrapper">

      {/* BOTONES SUPERIORES IZQUIERDA */}
      <div className="top-left-buttons">
        <button className="logo-btn" onClick={() => setShowInfo(true)}>
          <img src="/logovr.png" alt="Logo" />
        </button>

        <button className="help-btn" onClick={() => setShowHelp(true)}>
          ?
        </button>
      </div>

      {/* BOTONES SUPERIORES DERECHA */}
      <div className="top-buttons">
        <button className="icon-btn" onClick={newProblem} title="Nuevo problema">
          🎲
        </button>
        <button className="icon-btn" onClick={restartProblem} title="Reiniciar este problema">
          🔄
        </button>
        <button className="icon-btn close-btn" onClick={() => window.close()} title="Cerrar aplicación">
          ❌
        </button>
      </div>

      {/* MODAL DE ERROR */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-window">
            <h2>Revisa este paso</h2>
            <p>{modalMessage}</p>
            <button className="modal-button" onClick={() => setShowModal(false)}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE ÉXITO */}
      {completed && (
        <div className="modal-overlay">
          <div className="modal-window success-window">
            <h2>¡Genial, lo has conseguido!</h2>

            <p>
              La resta de {operation.a} y {operation.b} es{" "}
              <strong>{operation.a - operation.b}</strong>.
            </p>

            <button className="modal-button success-button" onClick={newProblem}>
              ¡Vamos a por otro!
            </button>
          </div>
        </div>
      )}

      {/* MODAL CORPORATIVO */}
      {showInfo && (
        <div className="modal-overlay">
          <div className="modal-window">

            {/* LOGOTIPO ARRIBA */}
            <div style={{ textAlign: "center", marginBottom: "15px" }}>
              <img 
                src="/logovr.png" 
                alt="Logo corporativo" 
                style={{ width: "80px", height: "80px" }}
              />
            </div>

            <h2>Información</h2>

            <p><strong>Nombre de la aplicación:</strong> Resta ABN</p>
            <p><strong>Creado por:</strong> Valentín Ruiz León</p>
            <p>Desarrollador de Aplicaciones Web</p>
            <p>
              <strong>GitHub:</strong>{" "}
              <a href="https://github.com/valentinrl9" target="_blank">
                valentinrl9
              </a>
            </p>

            <button className="modal-button" onClick={() => setShowInfo(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}


      {/* MODAL DE AYUDA */}
      {showHelp && (
        <div className="modal-overlay">
          <div className="modal-window">
            <h2>Ayuda / Tutorial</h2>

            <ul>
              <li>Al iniciar la aplicación se genera automáticamente una operación de resta.</li>
              <li>Puedes seleccionar el nivel de dificultad entre 1 y 5.</li>
              <li>Introduce en cada cuadro los valores que consideres adecuados para resolver la operación paso a paso.</li>
              <li>Mientras los valores introducidos sean correctos, la operación avanzará con normalidad.</li>
              <li>Si algún movimiento, suma o resta es incorrecto, aparecerá un mensaje de error indicando que debes revisarlo.</li>
              <li>El botón con la flecha roja permite borrar el último valor introducido.</li>
              <li>El botón «OK» confirma el valor introducido y continúa con el siguiente paso.</li>
              <li>Utiliza los botones disponibles para seleccionar el tipo de cálculo que deseas practicar.</li>
              <li>Puedes deslizar o pulsar sobre la interfaz para visualizar los resultados paso a paso.</li>
              <li>Al completar correctamente toda la operación, aparecerá un mensaje de felicitación acompañado de una animación de confeti.</li>
            </ul>

            <button className="modal-button" onClick={() => setShowHelp(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* SELECTOR DE DIFICULTAD */}
      <div className="difficulty-container">
        <label className="difficulty-label">Nivel:</label>
        <select
          value={difficulty}
          onChange={(e) => changeDifficulty(parseInt(e.target.value))}
          className="difficulty-select"
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
        </select>
      </div>

      {/* OPERACIÓN PRINCIPAL */}
      <h1 className="operation">
        {operation.a} {operation.op} {operation.b}
      </h1>

      {/* TABLA ABN */}
      <ABNTable
        rows={rows}
        activeField={activeField}
        onFocusField={(row, field) => setActiveField([row, field])}
      />

      {/* NUMPAD */}
      <NumPad
        onInput={handleNumPadInput}
        onDelete={handleDelete}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

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
  return { a, b, op: "+" };
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

  const getBig = () => Math.max(operation.a, operation.b);
  const getSmall = () => Math.min(operation.a, operation.b);
  const result = operation.a + operation.b;


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
      const expectedFirst = parseInt(prev.first) + move;
      curr.firstValid = first === expectedFirst;

      if (!curr.firstValid) {
        showError(
          `Este es el resultado de sumar el número anterior mas el que muevo: ${prev.first} + ${move} = ?`
        );
        return true;
      }
    }

    if (field === "second") {
      const expectedSecond = parseInt(prev.second) - move;
      curr.secondValid = second === expectedSecond;

      if (!curr.secondValid) {
        showError(
          `Este es el resultado de restar al número anterior el que muevo: ${prev.second} - ${move} = ?`
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
      <div className="top-buttons">
        <button
          className="icon-btn"
          onClick={newProblem}
          title="Nuevo problema"
        >
          🎲
        </button>
        <button
          className="icon-btn"
          onClick={restartProblem}
          title="Reiniciar este problema"
        >
          🔄
        </button>
        <button
          className="icon-btn close-btn"
          onClick={() => window.close()}
          title="Cerrar aplicación"
        >
          ❌
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-window">
            <h2>Revisa este paso</h2>
            <p>{modalMessage}</p>
            <button
              className="modal-button"
              onClick={() => setShowModal(false)}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {completed && (
        <div className="modal-overlay">
          <div className="modal-window success-window">
            <h2>¡Genial, lo has conseguido!</h2>

            <p>
              La suma de {operation.a} y {operation.b} es{" "}
              <strong>{operation.a + operation.b}</strong>.
            </p>

            <button
              className="modal-button success-button"
              onClick={newProblem}
            >
              ¡Vamos a por otro!
            </button>
          </div>
        </div>
      )}


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

      <h1 className="operation">
        {operation.a} {operation.op} {operation.b}
      </h1>

      <div className="operation-sorted">
        {getBig()} {operation.op} {getSmall()}
        <span className="sorted-label"> (ordenado)</span>
      </div>

      <div className="arrow">⟵</div>

      <ABNTable
        rows={rows}
        activeField={activeField}
        onFocusField={(row, field) => setActiveField([row, field])}
      />

      <NumPad
        onInput={handleNumPadInput}
        onDelete={handleDelete}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

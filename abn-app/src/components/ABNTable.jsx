export default function ABNTable({ rows, activeField, onFocusField }) {
  return (
    <table className="abn-table">
      <thead>
        <tr>
          <th className="abn-header">Muevo</th>
          <th className="abn-header">1º núm.</th>
          <th className="abn-header">2º núm.</th>
        </tr>
      </thead>

      <tbody>
        {rows.map((row, i) => {
          const isLocked = i === 0;

          return (
            <tr key={i}>

              {/* MOVIMIENTO */}
              <td>
                <input
                  value={row.move}
                  onFocus={() => !isLocked && onFocusField(i, "move")}
                  readOnly
                  className={`abn-input
                    ${row.move === "" ? "empty" :
                      row.valid === true ? "valid" :
                      row.valid === false ? "invalid" : "filled"}
                    ${isLocked ? "locked" : ""}
                    ${activeField && activeField[0] === i && activeField[1] === "move" ? "active" : ""}
                  `}
                />
              </td>

              {/* PRIMER NÚMERO */}
              <td>
                <input
                  value={row.first}
                  onFocus={() => !isLocked && onFocusField(i, "first")}
                  readOnly
                  className={`abn-input
                    ${row.first === "" ? "empty" :
                      row.firstValid === true ? "valid" :
                      row.firstValid === false ? "invalid" : "filled"}
                    ${isLocked ? "locked" : ""}
                    ${activeField && activeField[0] === i && activeField[1] === "first" ? "active" : ""}
                  `}
                />
              </td>

              {/* SEGUNDO NÚMERO */}
              <td>
                <input
                  value={row.second}
                  onFocus={() => !isLocked && onFocusField(i, "second")}
                  readOnly
                  className={`abn-input
                    ${row.second === "" ? "empty" :
                      row.secondValid === true ? "valid" :
                      row.secondValid === false ? "invalid" : "filled"}
                    ${isLocked ? "locked" : ""}
                    ${activeField && activeField[0] === i && activeField[1] === "second" ? "active" : ""}
                  `}
                />
              </td>

            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

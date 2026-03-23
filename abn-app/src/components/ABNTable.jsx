export default function ABNTable({ rows, activeField, onFocusField }) {
  
  // Función para generar clases de cada input
  const getInputClass = (row, field, isLocked, isActive) => {
    const value = row[field];
    const validKey = field === "move" ? "valid" : field + "Valid";
    const validity = row[validKey];

    let cls = "abn-input ";

    if (isLocked) cls += "locked ";
    else if (value === "") cls += "empty ";
    else if (validity === true) cls += "valid ";
    else if (validity === false) cls += "invalid ";
    else cls += "filled ";

    if (isActive) cls += "active ";

    return cls.trim();
  };

  return (
    <div className="abn-table-wrapper">
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
                    readOnly
                    onFocus={() => !isLocked && onFocusField(i, "move")}
                    className={getInputClass(
                      row,
                      "move",
                      isLocked,
                      activeField?.[0] === i && activeField?.[1] === "move"
                    )}
                  />
                </td>

                {/* PRIMER NÚMERO */}
                <td>
                  <input
                    value={row.first}
                    readOnly
                    onFocus={() => !isLocked && onFocusField(i, "first")}
                    className={getInputClass(
                      row,
                      "first",
                      isLocked,
                      activeField?.[0] === i && activeField?.[1] === "first"
                    )}
                  />
                </td>

                {/* SEGUNDO NÚMERO */}
                <td>
                  <input
                    value={row.second}
                    readOnly
                    onFocus={() => !isLocked && onFocusField(i, "second")}
                    className={getInputClass(
                      row,
                      "second",
                      isLocked,
                      activeField?.[0] === i && activeField?.[1] === "second"
                    )}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

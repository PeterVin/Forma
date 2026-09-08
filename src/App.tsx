import type { CSSProperties } from "react";

import { colorVariables, defaultTheme } from "./theme";

function App() {
  const colors = defaultTheme.colors.light;
  const previewStyle = colorVariables(colors) as CSSProperties;
  const swatches = [
    ["background", colors.background],
    ["surface", colors.surface],
    ["text", colors.text],
    ["mutedText", colors.mutedText],
    ["primary", colors.primary],
    ["primaryContrast", colors.primaryContrast],
    ["border", colors.border],
  ] as const;

  return (
    <main className="workspace">
      <header className="intro">
        <p className="eyebrow">Foundation</p>
        <h1>Theme studio</h1>
        <p>
          First step: start with a strict project boundary and semantic theme.
        </p>
      </header>

      <section className="palette" aria-labelledby="palette-title">
        <div>
          <p className="eyebrow">Domain proof</p>
          <h2 id="palette-title">Sematic palette</h2>
        </div>
        <div className="swatches">
          {swatches.map(([name, value]) => (
            <article className="swatch" key={name}>
              <span style={{ backgroundColor: value }} />
              <strong>{name}</strong>
              <code>{value}</code>
            </article>
          ))}
        </div>
      </section>

      <section
        className="preview"
        style={previewStyle}
        aria-labelledby="preview-title"
      >
        <p>Static vertical slice</p>
        <h2 id="preview-title">A theme shound describe intent</h2>
        <p>
          Component consume semantic variables instead of knowing palette
          values.
        </p>
        <button type="button">Primary action</button>
      </section>
    </main>
  );
}

export default App;

import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as i}from"./index.WFquGv8Z.js";import{D as C,l as E,a as f,b as u,C as l,E as b,s as T}from"./preferences.DZPTYPjL.js";function P(){const[r,g]=i.useState(C),[o,c]=i.useState(!1),[,v]=i.useTransition(),h=i.useRef(r);h.current=r;const d=i.useRef(null),p=t=>{window.dispatchEvent(new CustomEvent("ascii-settings-change",{detail:{effect:t.effect,speed:t.speed,intensity:t.intensity,color:l[t.colorTheme].primary,showFps:t.showFps}}))},m=()=>{d.current&&(clearTimeout(d.current),d.current=null)},x=()=>{m();const t=()=>{const a=Math.random()*16e3+4e3;d.current=setTimeout(()=>{const n=["wave","matrix","pulse","glitch"],k=h.current,N=(n.indexOf(k.effect)+1)%n.length;s("effect",n[N]),t()},a)};t()},s=(t,a)=>{v(()=>{const n=T({[t]:a});g(n),t==="theme"?f(a):t==="colorTheme"?(u(a),p(n)):t==="autoCycle"?a?x():m():p(n)})},y=i.useRef(s);y.current=s,i.useEffect(()=>{const t=E();return g(t),f(t.theme),u(t.colorTheme),p(t),t.autoCycle&&x(),()=>{m()}},[]),i.useEffect(()=>{const t=a=>{a.target instanceof HTMLInputElement||a.target instanceof HTMLTextAreaElement||a.key==="Escape"&&o&&c(!1)};return window.addEventListener("keydown",t),()=>window.removeEventListener("keydown",t)},[o]);const w=[{value:"light",label:"Light"},{value:"dark",label:"Dark"},{value:"system",label:"Auto"}],j=[{value:"wave"},{value:"matrix"},{value:"pulse"},{value:"glitch"}];return e.jsxs(e.Fragment,{children:[e.jsx("button",{onClick:()=>c(!o),className:"settings-toggle","aria-label":"Toggle settings","aria-expanded":o,children:e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3"}),e.jsx("path",{d:"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"})]})}),e.jsxs("div",{className:`settings-panel ${o?"open":""}`,children:[e.jsxs("div",{className:"settings-header",children:[e.jsx("h3",{children:"Settings"}),e.jsx("button",{onClick:()=>c(!1),className:"close-btn","aria-label":"Close settings",children:e.jsx("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:e.jsx("path",{d:"M18 6L6 18M6 6l12 12"})})})]}),e.jsxs("div",{className:"settings-content",children:[e.jsxs("div",{className:"setting-section",children:[e.jsx("label",{className:"setting-label",children:"Appearance"}),e.jsx("div",{className:"segment-control",children:w.map(({value:t,label:a})=>e.jsx("button",{onClick:()=>s("theme",t),className:`segment-btn ${r.theme===t?"active":""}`,children:a},t))})]}),e.jsxs("div",{className:"setting-section",children:[e.jsx("label",{className:"setting-label",children:"Accent Colour"}),e.jsx("div",{className:"color-pills",children:Object.keys(l).map(t=>e.jsx("button",{onClick:()=>s("colorTheme",t),className:`color-pill ${r.colorTheme===t?"active":""}`,style:{"--pill-color":l[t].primary},title:l[t].name,"aria-label":l[t].name,children:e.jsx("span",{className:"color-dot"})},t))})]}),e.jsxs("div",{className:"setting-section",children:[e.jsx("label",{className:"setting-label",children:"Background Effect"}),e.jsx("div",{className:"effect-list",children:j.map(({value:t})=>e.jsxs("button",{onClick:()=>s("effect",t),className:`effect-item ${r.effect===t?"active":""}`,children:[e.jsx("span",{className:"effect-name",children:b[t].name}),e.jsx("span",{className:"effect-desc",children:b[t].description})]},t))})]}),e.jsx("div",{className:"setting-section",children:e.jsxs("div",{className:"slider-group",children:[e.jsxs("label",{className:"setting-label",children:["Speed",e.jsxs("span",{className:"value-badge",children:[r.speed.toFixed(1),"×"]})]}),e.jsx("input",{type:"range",min:"0.25",max:"3",step:"0.25",value:r.speed,onChange:t=>s("speed",parseFloat(t.target.value)),className:"slider"})]})}),e.jsx("div",{className:"setting-section",children:e.jsxs("div",{className:"slider-group",children:[e.jsxs("label",{className:"setting-label",children:["Intensity",e.jsxs("span",{className:"value-badge",children:[Math.round(r.intensity*100),"%"]})]}),e.jsx("input",{type:"range",min:"0.1",max:"1",step:"0.1",value:r.intensity,onChange:t=>s("intensity",parseFloat(t.target.value)),className:"slider"})]})}),e.jsx("div",{className:"setting-section",children:e.jsxs("label",{className:"toggle-label",children:[e.jsx("span",{className:"toggle-text",children:"Auto-cycle effects"}),e.jsx("div",{className:`toggle ${r.autoCycle?"active":""}`,onClick:()=>s("autoCycle",!r.autoCycle),children:e.jsx("div",{className:"toggle-thumb"})})]})}),e.jsx("div",{className:"setting-section",children:e.jsxs("label",{className:"toggle-label",children:[e.jsx("span",{className:"toggle-text",children:"Show FPS"}),e.jsx("div",{className:`toggle ${r.showFps?"active":""}`,onClick:()=>s("showFps",!r.showFps),children:e.jsx("div",{className:"toggle-thumb"})})]})})]})]}),o&&e.jsx("div",{className:"settings-backdrop",onClick:()=>c(!1)}),e.jsx("style",{children:`
        .settings-toggle {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          z-index: 100;
          box-shadow: var(--shadow-md);
        }

        .settings-toggle:hover {
          background: var(--bg-elevated);
          color: var(--color-primary);
          border-color: var(--color-primary);
          transform: rotate(30deg);
        }

        .settings-panel {
          position: fixed;
          bottom: 5.5rem;
          right: 1.5rem;
          width: 320px;
          max-height: calc(100vh - 8rem);
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius, 12px);
          box-shadow: var(--shadow-lg);
          z-index: 101;
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .settings-panel.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--border-color);
        }

        .settings-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }

        .close-btn:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }

        .settings-content {
          padding: 1rem 1.25rem;
          overflow-y: auto;
          max-height: calc(100vh - 14rem);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .setting-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          opacity: 0;
          animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .settings-panel:not(.open) .setting-section {
          animation: none;
          opacity: 0;
        }

        .setting-section:nth-child(1) {
          animation-delay: 0.05s;
        }

        .setting-section:nth-child(2) {
          animation-delay: 0.1s;
        }

        .setting-section:nth-child(3) {
          animation-delay: 0.15s;
        }

        .setting-section:nth-child(4) {
          animation-delay: 0.2s;
        }

        .setting-section:nth-child(5) {
          animation-delay: 0.25s;
        }

        .setting-section:nth-child(6) {
          animation-delay: 0.3s;
        }

        .setting-section:nth-child(7) {
          animation-delay: 0.35s;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .setting-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.03em;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .value-badge {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--color-primary);
          background: var(--ascii-tint);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .segment-control {
          display: flex;
          background: var(--bg-primary);
          border-radius: 8px;
          padding: 3px;
          gap: 2px;
        }

        .segment-btn {
          flex: 1;
          padding: 0.5rem;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.15s;
        }

        .segment-btn:hover {
          color: var(--text-primary);
        }

        .segment-btn.active {
          background: var(--bg-card);
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
        }

        .color-pills {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .color-pill {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid transparent;
          background: var(--bg-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }

        .color-pill:hover {
          transform: scale(1.1);
        }

        .color-pill.active {
          border-color: var(--pill-color);
          background: var(--bg-elevated);
        }

        .color-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--pill-color);
        }

        .effect-list {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .effect-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.625rem 0.75rem;
          background: var(--bg-primary);
          border: 1px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .effect-item:hover {
          background: var(--bg-elevated);
        }

        .effect-item.active {
          border-color: var(--color-primary);
          background: var(--ascii-tint);
        }

        .effect-name {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .effect-item.active .effect-name {
          color: var(--color-primary);
        }

        .effect-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .slider-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .slider {
          width: 100%;
          height: 4px;
          background: var(--bg-primary);
          border-radius: 2px;
          outline: none;
          -webkit-appearance: none;
          appearance: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: var(--color-primary);
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.15s;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: var(--color-primary);
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }

        .toggle-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .toggle-text {
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .toggle {
          width: 44px;
          height: 24px;
          background: var(--bg-primary);
          border-radius: 12px;
          padding: 2px;
          transition: background 0.2s;
          cursor: pointer;
        }

        .toggle.active {
          background: var(--color-primary);
        }

        .toggle-thumb {
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: transform 0.2s;
          box-shadow: var(--shadow-sm);
        }

        .toggle.active .toggle-thumb {
          transform: translateX(20px);
        }

        .settings-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 99;
          backdrop-filter: blur(2px);
        }

        @media (max-width: 480px) {
          .settings-panel {
            right: 0.75rem;
            left: 0.75rem;
            bottom: 5rem;
            width: auto;
          }

          .settings-toggle {
            bottom: 1rem;
            right: 1rem;
            width: 44px;
            height: 44px;
          }
        }
      `})]})}export{P as default};

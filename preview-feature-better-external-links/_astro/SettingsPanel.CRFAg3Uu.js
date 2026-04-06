import{j as t}from"./jsx-runtime.D_zvdyIk.js";import{R as g,r as p}from"./index.1gEKNThO.js";import{D as I,l as L,a as y,b as j,C as h,E as w,s as R}from"./preferences.DZPTYPjL.js";import"./_commonjsHelpers.CqkleIqs.js";var O={color:void 0,size:void 0,className:void 0,style:void 0,attr:void 0},N=g.createContext&&g.createContext(O),_=["attr","size","title"];function D(e,a){if(e==null)return{};var r=A(e,a),i,o;if(Object.getOwnPropertySymbols){var d=Object.getOwnPropertySymbols(e);for(o=0;o<d.length;o++)i=d[o],!(a.indexOf(i)>=0)&&Object.prototype.propertyIsEnumerable.call(e,i)&&(r[i]=e[i])}return r}function A(e,a){if(e==null)return{};var r={};for(var i in e)if(Object.prototype.hasOwnProperty.call(e,i)){if(a.indexOf(i)>=0)continue;r[i]=e[i]}return r}function b(){return b=Object.assign?Object.assign.bind():function(e){for(var a=1;a<arguments.length;a++){var r=arguments[a];for(var i in r)Object.prototype.hasOwnProperty.call(r,i)&&(e[i]=r[i])}return e},b.apply(this,arguments)}function k(e,a){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);a&&(i=i.filter(function(o){return Object.getOwnPropertyDescriptor(e,o).enumerable})),r.push.apply(r,i)}return r}function x(e){for(var a=1;a<arguments.length;a++){var r=arguments[a]!=null?arguments[a]:{};a%2?k(Object(r),!0).forEach(function(i){M(e,i,r[i])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):k(Object(r)).forEach(function(i){Object.defineProperty(e,i,Object.getOwnPropertyDescriptor(r,i))})}return e}function M(e,a,r){return a=$(a),a in e?Object.defineProperty(e,a,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[a]=r,e}function $(e){var a=W(e,"string");return typeof a=="symbol"?a:a+""}function W(e,a){if(typeof e!="object"||!e)return e;var r=e[Symbol.toPrimitive];if(r!==void 0){var i=r.call(e,a);if(typeof i!="object")return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return(a==="string"?String:Number)(e)}function C(e){return e&&e.map((a,r)=>g.createElement(a.tag,x({key:r},a.attr),C(a.child)))}function E(e){return a=>g.createElement(B,b({attr:x({},e.attr)},a),C(e.child))}function B(e){var a=r=>{var{attr:i,size:o,title:d}=e,u=D(e,_),f=o||r.size||"1em",c;return r.className&&(c=r.className),e.className&&(c=(c?c+" ":"")+e.className),g.createElement("svg",b({stroke:"currentColor",fill:"currentColor",strokeWidth:"0"},r.attr,i,u,{className:c,style:x(x({color:e.color||r.color},r.style),e.style),height:f,width:f,xmlns:"http://www.w3.org/2000/svg"}),d&&g.createElement("title",null,d),e.children)};return N!==void 0?g.createElement(N.Consumer,null,r=>a(r)):a(O)}function H(e){return E({attr:{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"},child:[{tag:"path",attr:{d:"M20 7h-9"},child:[]},{tag:"path",attr:{d:"M14 17H5"},child:[]},{tag:"circle",attr:{cx:"17",cy:"17",r:"3"},child:[]},{tag:"circle",attr:{cx:"7",cy:"7",r:"3"},child:[]}]})(e)}function Y(e){return E({attr:{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"},child:[{tag:"path",attr:{d:"M18 6 6 18"},child:[]},{tag:"path",attr:{d:"m6 6 12 12"},child:[]}]})(e)}function J(){const[e,a]=p.useState(I),[r,i]=p.useState(!1),[,o]=p.useTransition(),d=p.useRef(e);d.current=e;const u=p.useRef(null),f=n=>{window.dispatchEvent(new CustomEvent("ascii-settings-change",{detail:{effect:n.effect,speed:n.speed,intensity:n.intensity,color:h[n.colorTheme].primary,showFps:n.showFps}}))},c=()=>{u.current&&(clearTimeout(u.current),u.current=null)},v=()=>{c();const n=()=>{const s=Math.random()*16e3+4e3;u.current=setTimeout(()=>{const m=["wave","matrix","pulse","glitch"],S=d.current,F=(m.indexOf(S.effect)+1)%m.length;l("effect",m[F]),n()},s)};n()},l=(n,s)=>{o(()=>{const m=R({[n]:s});a(m),n==="theme"?y(s):n==="colorTheme"?(j(s),f(m)):n==="autoCycle"?s?v():c():f(m)})},P=p.useRef(l);P.current=l,p.useEffect(()=>{const n=L();return a(n),y(n.theme),j(n.colorTheme),f(n),n.autoCycle&&v(),()=>{c()}},[]),p.useEffect(()=>{const n=s=>{s.target instanceof HTMLInputElement||s.target instanceof HTMLTextAreaElement||s.key==="Escape"&&r&&i(!1)};return window.addEventListener("keydown",n),()=>window.removeEventListener("keydown",n)},[r]);const z=[{value:"light",label:"Light"},{value:"dark",label:"Dark"},{value:"system",label:"Auto"}],T=[{value:"wave"},{value:"matrix"},{value:"pulse"},{value:"glitch"}];return t.jsxs(t.Fragment,{children:[t.jsx("button",{onClick:()=>i(!r),className:"settings-toggle","aria-label":"Toggle settings","aria-expanded":r,children:t.jsx(H,{size:20})}),t.jsxs("div",{className:`settings-panel ${r?"open":""}`,children:[t.jsxs("div",{className:"settings-header",children:[t.jsx("h3",{children:"Settings"}),t.jsx("button",{onClick:()=>i(!1),className:"close-btn","aria-label":"Close settings",children:t.jsx(Y,{size:18})})]}),t.jsxs("div",{className:"settings-content",children:[t.jsxs("div",{className:"setting-section",children:[t.jsx("label",{className:"setting-label",children:"Appearance"}),t.jsx("div",{className:"segment-control",children:z.map(({value:n,label:s})=>t.jsx("button",{onClick:()=>l("theme",n),className:`segment-btn ${e.theme===n?"active":""}`,children:s},n))})]}),t.jsxs("div",{className:"setting-section",children:[t.jsx("label",{className:"setting-label",children:"Accent Colour"}),t.jsx("div",{className:"color-pills",children:Object.keys(h).map(n=>t.jsx("button",{onClick:()=>l("colorTheme",n),className:`color-pill ${e.colorTheme===n?"active":""}`,style:{"--pill-color":h[n].primary},title:h[n].name,"aria-label":h[n].name,children:t.jsx("span",{className:"color-dot"})},n))})]}),t.jsxs("div",{className:"setting-section",children:[t.jsx("label",{className:"setting-label",children:"Background Effect"}),t.jsx("div",{className:"effect-list",children:T.map(({value:n})=>t.jsxs("button",{onClick:()=>l("effect",n),className:`effect-item ${e.effect===n?"active":""}`,children:[t.jsx("span",{className:"effect-name",children:w[n].name}),t.jsx("span",{className:"effect-desc",children:w[n].description})]},n))})]}),t.jsx("div",{className:"setting-section",children:t.jsxs("div",{className:"slider-group",children:[t.jsxs("label",{className:"setting-label",children:["Speed",t.jsxs("span",{className:"value-badge",children:[e.speed.toFixed(1),"×"]})]}),t.jsx("input",{type:"range",min:"0.25",max:"3",step:"0.25",value:e.speed,onChange:n=>l("speed",parseFloat(n.target.value)),className:"slider"})]})}),t.jsx("div",{className:"setting-section",children:t.jsxs("div",{className:"slider-group",children:[t.jsxs("label",{className:"setting-label",children:["Intensity",t.jsxs("span",{className:"value-badge",children:[Math.round(e.intensity*100),"%"]})]}),t.jsx("input",{type:"range",min:"0.1",max:"1",step:"0.1",value:e.intensity,onChange:n=>l("intensity",parseFloat(n.target.value)),className:"slider"})]})}),t.jsx("div",{className:"setting-section",children:t.jsxs("label",{className:"toggle-label",children:[t.jsx("span",{className:"toggle-text",children:"Auto-cycle effects"}),t.jsx("div",{className:`toggle ${e.autoCycle?"active":""}`,onClick:()=>l("autoCycle",!e.autoCycle),children:t.jsx("div",{className:"toggle-thumb"})})]})}),t.jsx("div",{className:"setting-section",children:t.jsxs("label",{className:"toggle-label",children:[t.jsx("span",{className:"toggle-text",children:"Show FPS"}),t.jsx("div",{className:`toggle ${e.showFps?"active":""}`,onClick:()=>l("showFps",!e.showFps),children:t.jsx("div",{className:"toggle-thumb"})})]})})]})]}),r&&t.jsx("div",{className:"settings-backdrop",onClick:()=>i(!1)}),t.jsx("style",{children:`
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
      `})]})}export{J as default};

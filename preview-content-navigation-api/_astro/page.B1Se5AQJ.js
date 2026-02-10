import{i as w}from"./index.Khr0MROm.js";import"./client.B9YBqyHK.js";const E="modulepreload",A=function(r){return"/preview-content-navigation-api/"+r},p={},C=function(o,t,e){let m=Promise.resolve();if(t&&t.length>0){let a=function(i){return Promise.all(i.map(c=>Promise.resolve(c).then(l=>({status:"fulfilled",value:l}),l=>({status:"rejected",reason:l}))))};document.getElementsByTagName("link");const n=document.querySelector("meta[property=csp-nonce]"),f=n?.nonce||n?.getAttribute("nonce");m=a(t.map(i=>{if(i=A(i),i in p)return;p[i]=!0;const c=i.endsWith(".css"),l=c?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${i}"]${l}`))return;const d=document.createElement("link");if(d.rel=c?"stylesheet":E,c||(d.as="script"),d.crossOrigin="",d.href=i,f&&d.setAttribute("nonce",f),document.head.appendChild(d),c)return new Promise((k,v)=>{d.addEventListener("load",k),d.addEventListener("error",()=>v(new Error(`Unable to preload CSS for ${i}`)))})}))}function s(a){const n=new Event("vite:preloadError",{cancelable:!0});if(n.payload=a,window.dispatchEvent(n),!n.defaultPrevented)throw a}return m.then(a=>{for(const n of a||[])n.status==="rejected"&&s(n.reason);return o().catch(s)})},b=()=>document.querySelectorAll("pre.mermaid").length>0;let u=null;async function P(){return u||(console.log("[astro-mermaid] Loading mermaid.js..."),u=C(()=>import("./mermaid.core.yzQT7kJf.js").then(r=>r.bB),[]).then(async({default:r})=>{const o=[];if(o&&o.length>0){console.log("[astro-mermaid] Registering",o.length,"icon packs");const t=o.map(e=>({name:e.name,loader:new Function("return "+e.loader)()}));await r.registerIconPacks(t)}return r}).catch(r=>{throw console.error("[astro-mermaid] Failed to load mermaid:",r),u=null,r}),u)}const g={startOnLoad:!1,theme:"dark",themeVariables:{primaryColor:"#1a1a1a",primaryBorderColor:"#10b981",primaryTextColor:"#f5f5f5",lineColor:"#10b981",fontFamily:"'JetBrains Mono', 'Fira Code', monospace",tertiaryColor:"#252525",secondaryColor:"#252525"},flowchart:{curve:"basis"}},S={light:"default",dark:"dark"};async function h(){console.log("[astro-mermaid] Initializing mermaid diagrams...");const r=document.querySelectorAll("pre.mermaid");if(console.log("[astro-mermaid] Found",r.length,"mermaid diagrams"),r.length===0)return;const o=await P();let t=g.theme;{const e=document.documentElement.getAttribute("data-theme"),m=document.body.getAttribute("data-theme");t=S[e||m]||g.theme,console.log("[astro-mermaid] Using theme:",t,"from",e?"html":"body")}o.initialize({...g,theme:t,gitGraph:{mainBranchName:"main",showCommitLabel:!0,showBranches:!0,rotateCommitLabel:!0}});for(const e of r){if(e.hasAttribute("data-processed"))continue;e.hasAttribute("data-diagram")||e.setAttribute("data-diagram",e.textContent||"");const m=e.getAttribute("data-diagram")||"",s="mermaid-"+Math.random().toString(36).slice(2,11);console.log("[astro-mermaid] Rendering diagram:",s);try{const a=document.getElementById(s);a&&a.remove();const{svg:n}=await o.render(s,m);e.innerHTML=n,e.setAttribute("data-processed","true"),console.log("[astro-mermaid] Successfully rendered diagram:",s)}catch(a){console.error("[astro-mermaid] Mermaid rendering error for diagram:",s,a),e.innerHTML=`<div style="color: red; padding: 1rem; border: 1px solid red; border-radius: 0.5rem;">
        <strong>Error rendering diagram:</strong><br/>
        ${a.message||"Unknown error"}
      </div>`,e.setAttribute("data-processed","true")}}}b()?(console.log("[astro-mermaid] Mermaid diagrams detected on initial load"),h()):console.log("[astro-mermaid] No mermaid diagrams found on initial load");{const r=new MutationObserver(o=>{for(const t of o)t.type==="attributes"&&t.attributeName==="data-theme"&&(document.querySelectorAll("pre.mermaid[data-processed]").forEach(e=>{e.removeAttribute("data-processed")}),h())});r.observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme"]}),r.observe(document.body,{attributes:!0,attributeFilter:["data-theme"]})}document.addEventListener("astro:after-swap",()=>{console.log("[astro-mermaid] View transition detected"),b()&&h()});const y=document.createElement("style");y.textContent=`
            /* Prevent layout shifts by setting minimum height */
            pre.mermaid {
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 2rem 0;
              padding: 1rem;
              background-color: transparent;
              border: none;
              overflow: auto;
              min-height: 200px; /* Prevent layout shift */
              position: relative;
            }
            
            /* Loading state with skeleton loader */
            pre.mermaid:not([data-processed]) {
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: shimmer 1.5s infinite;
            }
            
            /* Dark mode skeleton loader */
            [data-theme="dark"] pre.mermaid:not([data-processed]) {
              background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
              background-size: 200% 100%;
            }
            
            @keyframes shimmer {
              0% {
                background-position: -200% 0;
              }
              100% {
                background-position: 200% 0;
              }
            }
            
            /* Show processed diagrams with smooth transition */
            pre.mermaid[data-processed] {
              animation: none;
              background: transparent;
              min-height: auto; /* Allow natural height after render */
            }
            
            /* Ensure responsive sizing for mermaid SVGs */
            pre.mermaid svg {
              max-width: 100%;
              height: auto;
            }
            
            /* Optional: Add subtle background for better visibility */
            @media (prefers-color-scheme: dark) {
              pre.mermaid[data-processed] {
                background-color: rgba(255, 255, 255, 0.02);
                border-radius: 0.5rem;
              }
            }
            
            @media (prefers-color-scheme: light) {
              pre.mermaid[data-processed] {
                background-color: rgba(0, 0, 0, 0.02);
                border-radius: 0.5rem;
              }
            }
            
            /* Respect user's color scheme preference */
            [data-theme="dark"] pre.mermaid[data-processed] {
              background-color: rgba(255, 255, 255, 0.02);
              border-radius: 0.5rem;
            }
            
            [data-theme="light"] pre.mermaid[data-processed] {
              background-color: rgba(0, 0, 0, 0.02);
              border-radius: 0.5rem;
            }
          `;document.head.appendChild(y);w();export{C as _};

import{a as e}from"./rolldown-runtime-Cyuzqnbw.js";import{Nr as t,l as n,wr as r}from"./commons-_KS4fJYe.js";import{Bt as i,Dt as a,Et as o,Ht as s,It as c,Pt as l,S as u,Tt as d,Un as f,Ut as p,Vt as m,X as h,_ as g,b as _,d as v,lt as y,pt as b,x,y as S}from"./icons-C9Vp_Mjk.js";import{a as C,c as w,i as T,l as E,n as D,o as O,r as k,s as A,t as j,u as M}from"./vendor-libs-Ch8VxxDl.js";var N=e(t(),1),P=r(),F=[{name:`Charcoal (Default)`,value:`#374151`},{name:`Negro`,value:`#111827`},{name:`Dorado Catedral`,value:`#D97706`},{name:`Rojo Carmesí`,value:`#DC2626`},{name:`Azul Real`,value:`#1E3A8A`},{name:`Verde Esmeralda`,value:`#16A34A`},{name:`Púrpura Imperial`,value:`#7C3AED`}],I=({content:e,onChange:t,disabled:r=!1})=>{let I=M({editable:!r,extensions:[w,A.configure({inline:!1,width:480,height:320}),O.configure({allowBase64:!0,HTMLAttributes:{class:`editor-image rounded-lg max-w-full my-4 mx-auto block shadow-md`}}),C.configure({types:[`heading`,`paragraph`]}),T,k,D,j.configure({nested:!0})],content:e,onUpdate:({editor:e})=>{let r=e.getHTML();t(n.sanitize(r,{ADD_TAGS:[`iframe`,`img`,`input`,`label`,`span`],ADD_ATTR:[`allowfullscreen`,`frameborder`,`src`,`width`,`height`,`style`,`class`,`alt`,`title`,`type`,`checked`,`disabled`,`data-type`,`data-checked`]}))}});if((0,N.useEffect)(()=>{I&&I.isEditable===r&&I.setEditable(!r)},[I,r]),!I)return null;let L=()=>{let e=prompt(`Ingresa la URL del video de YouTube:`);e&&I.commands.setYoutubeVideo({src:e})},R=()=>{let e=prompt(`Ingresa la URL de la imagen:`);e&&I.chain().focus().setImage({src:e}).run()};return(0,P.jsxs)(`div`,{className:`border border-gray-300 rounded-lg overflow-hidden bg-white dark:bg-stone-800 shadow-sm focus-within:border-gold focus-within:ring-1 focus-within:ring-gold transition-all duration-200`,children:[(0,P.jsx)(`style`,{children:`
        .ProseMirror {
          outline: none;
          min-height: 200px;
        }
        .ProseMirror h1 {
          font-size: 1.8rem;
          font-weight: 800;
          color: #111827;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-top: 1.2rem;
          margin-bottom: 0.4rem;
          line-height: 1.25;
        }
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
          margin-top: 1rem;
          margin-bottom: 0.3rem;
          line-height: 1.3;
        }
        .ProseMirror h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #4b5563;
          margin-top: 0.8rem;
          margin-bottom: 0.2rem;
          line-height: 1.35;
        }
        .ProseMirror p {
          margin-bottom: 0.75rem;
          line-height: 1.6;
          color: #374151;
        }
        .ProseMirror ul:not([data-type="taskList"]) {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .ProseMirror li {
          margin-bottom: 0.25rem;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #D97706;
          padding-left: 1rem;
          color: #4b5563;
          font-style: italic;
          margin: 1rem 0;
          background-color: #fef3c7;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          border-radius: 0 0.375rem 0.375rem 0;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin: 1rem auto;
          display: block;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        /* Estilos para la lista de tareas / checklists */
        .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
          margin-bottom: 0.75rem;
        }
        .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }
        .ProseMirror ul[data-type="taskList"] li > label {
          margin-right: 0.2rem;
          user-select: none;
          display: flex;
          align-items: center;
          padding-top: 0.25rem;
        }
        .ProseMirror ul[data-type="taskList"] li > label input {
          cursor: pointer;
          width: 1rem;
          height: 1rem;
          border-radius: 0.25rem;
          border: 1px solid #cbd5e1;
        }
        .ProseMirror ul[data-type="taskList"] li > div {
          flex: 1;
        }
        .ProseMirror ul[data-type="taskList"] li[data-checked="true"] > div {
          text-decoration: line-through;
          color: #94a3b8;
        }
      `}),!r&&(0,P.jsxs)(`div`,{className:`flex flex-wrap gap-1 p-2 border-b bg-gray-50 border-gray-200 dark:border-stone-700 items-center justify-between`,children:[(0,P.jsxs)(`div`,{className:`flex flex-wrap gap-1 items-center`,children:[(0,P.jsx)(`button`,{onClick:e=>{e.preventDefault(),I.chain().focus().undo().run()},onMouseDown:e=>e.preventDefault(),disabled:!I.can().undo(),className:`p-1.5 rounded text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer`,type:`button`,title:`Deshacer`,children:(0,P.jsx)(v,{size:16})}),(0,P.jsx)(`button`,{onClick:e=>{e.preventDefault(),I.chain().focus().redo().run()},onMouseDown:e=>e.preventDefault(),disabled:!I.can().redo(),className:`p-1.5 rounded text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer`,type:`button`,title:`Rehacer`,children:(0,P.jsx)(h,{size:16})}),(0,P.jsx)(`div`,{className:`w-px h-5 bg-gray-300 mx-1`}),(0,P.jsx)(`button`,{onClick:e=>{e.preventDefault(),I.chain().focus().toggleHeading({level:1}).run()},onMouseDown:e=>e.preventDefault(),className:`p-1.5 rounded text-gray-600 cursor-pointer ${I.isActive(`heading`,{level:1})?`bg-gray-200 font-bold text-black ring-1 ring-gray-300`:`hover:bg-gray-200`}`,type:`button`,title:`Título 1`,children:(0,P.jsx)(p,{size:16})}),(0,P.jsx)(`button`,{onClick:e=>{e.preventDefault(),I.chain().focus().toggleHeading({level:2}).run()},onMouseDown:e=>e.preventDefault(),className:`p-1.5 rounded text-gray-600 cursor-pointer ${I.isActive(`heading`,{level:2})?`bg-gray-200 font-bold text-black ring-1 ring-gray-300`:`hover:bg-gray-200`}`,type:`button`,title:`Título 2`,children:(0,P.jsx)(s,{size:16})}),(0,P.jsx)(`button`,{onClick:e=>{e.preventDefault(),I.chain().focus().toggleHeading({level:3}).run()},onMouseDown:e=>e.preventDefault(),className:`p-1.5 rounded text-gray-600 cursor-pointer ${I.isActive(`heading`,{level:3})?`bg-gray-200 font-bold text-black ring-1 ring-gray-300`:`hover:bg-gray-200`}`,type:`button`,title:`Título 3`,children:(0,P.jsx)(i,{size:16})}),(0,P.jsx)(`button`,{onClick:e=>{e.preventDefault(),I.chain().focus().toggleHeading({level:4}).run()},onMouseDown:e=>e.preventDefault(),className:`p-1.5 rounded text-gray-600 cursor-pointer ${I.isActive(`heading`,{level:4})?`bg-gray-200 font-bold text-black ring-1 ring-gray-300`:`hover:bg-gray-200`}`,type:`button`,title:`Título 4`,children:(0,P.jsx)(m,{size:16})}),(0,P.jsx)(`button`,{onClick:e=>{e.preventDefault(),I.chain().focus().setParagraph().run()},onMouseDown:e=>e.preventDefault(),className:`px-2 py-1 text-xs font-semibold rounded text-gray-600 cursor-pointer ${I.isActive(`paragraph`)&&!I.isActive(`heading`)?`bg-gray-200 text-black ring-1 ring-gray-300`:`hover:bg-gray-200`}`,type:`button`,title:`Texto Normal`,children:`P`}),(0,P.jsx)(`div`,{className:`w-px h-5 bg-gray-300 mx-1`}),(0,P.jsx)(`button`,{onClick:e=>{e.preventDefault(),I.chain().focus().toggleBold().run()},onMouseDown:e=>e.preventDefault(),className:`p-1.5 rounded text-gray-600 cursor-pointer ${I.isActive(`bold`)?`bg-gray-200 text-black ring-1 ring-gray-300`:`hover:bg-gray-200`}`,type:`button`,title:`Negrita`,children:(0,P.jsx)(f,{size:16})}),(0,P.jsx)(`button`,{onClick:e=>{e.preventDefault(),I.chain().focus().toggleItalic().run()},onMouseDown:e=>e.preventDefault(),className:`p-1.5 rounded text-gray-600 cursor-pointer ${I.isActive(`italic`)?`bg-gray-200 text-black ring-1 ring-gray-300`:`hover:bg-gray-200`}`,type:`button`,title:`Cursiva`,children:(0,P.jsx)(l,{size:16})}),(0,P.jsx)(`div`,{className:`w-px h-5 bg-gray-300 mx-1`}),(0,P.jsx)(`button`,{onClick:e=>{e.preventDefault(),I.chain().focus().setTextAlign(`left`).run()},onMouseDown:e=>e.preventDefault(),className:`p-1.5 rounded text-gray-600 cursor-pointer ${I.isActive({textAlign:`left`})?`bg-gray-200 text-black ring-1 ring-gray-300`:`hover:bg-gray-200`}`,type:`button`,title:`Alinear a la izquierda`,children:(0,P.jsx)(S,{size:16})}),(0,P.jsx)(`button`,{onClick:e=>{e.preventDefault(),I.chain().focus().setTextAlign(`center`).run()},onMouseDown:e=>e.preventDefault(),className:`p-1.5 rounded text-gray-600 cursor-pointer ${I.isActive({textAlign:`center`})?`bg-gray-200 text-black ring-1 ring-gray-300`:`hover:bg-gray-200`}`,type:`button`,title:`Centrar`,children:(0,P.jsx)(u,{size:16})}),(0,P.jsx)(`button`,{onClick:e=>{e.preventDefault(),I.chain().focus().setTextAlign(`right`).run()},onMouseDown:e=>e.preventDefault(),className:`p-1.5 rounded text-gray-600 cursor-pointer ${I.isActive({textAlign:`right`})?`bg-gray-200 text-black ring-1 ring-gray-300`:`hover:bg-gray-200`}`,type:`button`,title:`Alinear a la derecha`,children:(0,P.jsx)(x,{size:16})}),(0,P.jsx)(`button`,{onClick:e=>{e.preventDefault(),I.chain().focus().setTextAlign(`justify`).run()},onMouseDown:e=>e.preventDefault(),className:`p-1.5 rounded text-gray-600 cursor-pointer ${I.isActive({textAlign:`justify`})?`bg-gray-200 text-black ring-1 ring-gray-300`:`hover:bg-gray-200`}`,type:`button`,title:`Justificar`,children:(0,P.jsx)(_,{size:16})}),(0,P.jsx)(`div`,{className:`w-px h-5 bg-gray-300 mx-1`}),(0,P.jsx)(`button`,{onClick:e=>{e.preventDefault(),I.chain().focus().toggleBulletList().run()},onMouseDown:e=>e.preventDefault(),className:`p-1.5 rounded text-gray-600 cursor-pointer ${I.isActive(`bulletList`)?`bg-gray-200 text-black ring-1 ring-gray-300`:`hover:bg-gray-200`}`,type:`button`,title:`Lista con Viñetas`,children:(0,P.jsx)(d,{size:16})}),(0,P.jsx)(`button`,{onClick:e=>{e.preventDefault(),I.chain().focus().toggleOrderedList().run()},onMouseDown:e=>e.preventDefault(),className:`p-1.5 rounded text-gray-600 cursor-pointer ${I.isActive(`orderedList`)?`bg-gray-200 text-black ring-1 ring-gray-300`:`hover:bg-gray-200`}`,type:`button`,title:`Lista Numerada`,children:(0,P.jsx)(a,{size:16})}),(0,P.jsx)(`button`,{onClick:e=>{e.preventDefault(),I.chain().focus().toggleTaskList().run()},onMouseDown:e=>e.preventDefault(),className:`p-1.5 rounded text-gray-600 cursor-pointer ${I.isActive(`taskList`)?`bg-gray-200 text-black ring-1 ring-gray-300`:`hover:bg-gray-200`}`,type:`button`,title:`Lista de Tareas (Checklist)`,children:(0,P.jsx)(o,{size:16})}),(0,P.jsx)(`div`,{className:`w-px h-5 bg-gray-300 mx-1`}),(0,P.jsx)(`button`,{onClick:e=>{e.preventDefault(),R()},onMouseDown:e=>e.preventDefault(),className:`p-1.5 rounded text-gray-600 hover:bg-gray-200 cursor-pointer`,type:`button`,title:`Insertar Imagen por URL`,children:(0,P.jsx)(c,{size:16})}),(0,P.jsx)(`button`,{onClick:e=>{e.preventDefault(),L()},onMouseDown:e=>e.preventDefault(),className:`p-1.5 rounded text-red-600 hover:bg-gray-200 cursor-pointer`,type:`button`,title:`Insertar Video de YouTube`,children:(0,P.jsx)(b,{size:16})})]}),(0,P.jsxs)(`div`,{className:`flex items-center gap-1 bg-white dark:bg-stone-800 border border-gray-200 dark:border-stone-700 rounded px-1.5 py-0.5 mt-1 sm:mt-0`,children:[(0,P.jsx)(y,{size:14,className:`text-gray-400 mr-1`}),(0,P.jsx)(`div`,{className:`flex gap-0.5`,children:F.map(e=>(0,P.jsx)(`button`,{onClick:t=>{t.preventDefault(),I.chain().focus().setColor(e.value).run()},onMouseDown:e=>e.preventDefault(),className:`w-3.5 h-3.5 rounded-full border border-gray-200 transition-all hover:scale-125 cursor-pointer`,style:{backgroundColor:e.value},title:e.name,type:`button`},e.value))}),(0,P.jsx)(`input`,{type:`color`,value:I.getAttributes(`textStyle`).color||`#374151`,onChange:e=>{I.chain().focus().setColor(e.target.value).run()},onMouseDown:e=>e.preventDefault(),className:`w-4 h-4 border-0 cursor-pointer p-0 bg-transparent flex-shrink-0`,title:`Color personalizado`}),(0,P.jsx)(`button`,{onClick:e=>{e.preventDefault(),I.chain().focus().unsetColor().run()},onMouseDown:e=>e.preventDefault(),className:`p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-gray-100 cursor-pointer`,type:`button`,title:`Limpiar color`,children:(0,P.jsx)(g,{size:12})})]})]}),(0,P.jsx)(`div`,{className:`p-4 bg-white dark:bg-stone-800 text-gray-800 dark:text-stone-200`,children:(0,P.jsx)(E,{editor:I})})]})};export{I as t};
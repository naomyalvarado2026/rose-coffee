import{a as e}from"./rolldown-runtime-Cyuzqnbw.js";import{Nr as t,wr as n}from"./commons-_KS4fJYe.js";import{On as r,d as i}from"./icons-C-bsSFg5.js";var a=e(t(),1),o=n();function s({onUploadSuccess:e,folder:t=`general`,allowedFormats:n,label:s=`Subir Archivo`,className:c=``,multiple:l=!1}){return(0,a.useRef)(null),(0,a.useEffect)(()=>{console.error(`Cloudinary variables missing`)},[void 0,void 0,t,l,n,e]),(0,o.jsxs)(`button`,{type:`button`,onClick:(0,a.useCallback)(()=>{alert(`Configuración de Cloudinary incompleta.`)},[void 0,void 0]),className:`
        inline-flex items-center gap-2 px-4 py-2.5
        bg-gradient-to-br from-emerald-600 to-emerald-700
        hover:from-emerald-500 hover:to-emerald-600
        text-white text-xs font-bold uppercase tracking-wide
        rounded-xl shadow-md hover:shadow-lg
        transition-all duration-200
        cursor-pointer
        ${c}
      `,children:[(0,o.jsx)(r,{size:14,className:`opacity-80`}),(0,o.jsx)(i,{size:14}),(0,o.jsx)(`span`,{children:s})]})}export{s as t};
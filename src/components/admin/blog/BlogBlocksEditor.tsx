import { 
  FileText, ImageIcon, HelpCircle, Code, CheckSquare, 
  Trash2, ArrowUp, ArrowDown, Plus, BookOpen 
} from 'lucide-react';
import type { BlogBlock } from '../../../types';
import RichTextEditor from '../../../components/admin/RichTextEditor';

interface BlogBlocksEditorProps {
  blocks: BlogBlock[];
  onChange: (blocks: BlogBlock[]) => void;
}

export function BlogBlocksEditor({ blocks, onChange }: BlogBlocksEditorProps) {
  const addBlock = (type: BlogBlock['type']) => {
    let initialContent: any = {};
    if (type === 'text') initialContent = { text: '' };
    if (type === 'image') initialContent = { url: '', alt: '', alignment: 'center', size: 'medium', caption: '' };
    if (type === 'question') initialContent = { question: '', options: ['', ''], correctAnswerIndex: 0, explanation: '' };
    if (type === 'html') initialContent = { html: '' };
    if (type === 'true_false') initialContent = { statement: '', isTrue: true, explanation: '' };

    const newBlock: BlogBlock = {
      id: `block-${Date.now()}`,
      type,
      content: initialContent
    };
    onChange([...blocks, newBlock]);
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === blocks.length - 1)
    ) return;

    const newBlocks = [...blocks];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
    onChange(newBlocks);
  };

  const updateBlockContent = (index: number, newContent: Partial<any>) => {
    const updated = [...blocks];
    updated[index] = {
      ...updated[index],
      content: {
        ...updated[index].content,
        ...newContent
      }
    };
    onChange(updated);
  };

  return (
    <div className="bg-stone-50 border border-coffee/10 rounded-2xl p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-primary uppercase tracking-wider">
            Bloques del Contenido
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Añade, ordena y edita los bloques que formarán la estructura del artículo.
          </p>
        </div>
        
        {/* Botones Rápidos para Añadir Bloque */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => addBlock('text')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-gold hover:text-gold text-stone-600 rounded-lg text-xs font-bold transition-all shadow-xxs cursor-pointer"
          >
            <FileText size={14} />
            <span>+ Texto</span>
          </button>
          <button
            type="button"
            onClick={() => addBlock('image')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-gold hover:text-gold text-stone-600 rounded-lg text-xs font-bold transition-all shadow-xxs cursor-pointer"
          >
            <ImageIcon size={14} />
            <span>+ Imagen</span>
          </button>
          <button
            type="button"
            onClick={() => addBlock('question')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-gold hover:text-gold text-stone-600 rounded-lg text-xs font-bold transition-all shadow-xxs cursor-pointer"
          >
            <HelpCircle size={14} />
            <span>+ Pregunta</span>
          </button>
          <button
            type="button"
            onClick={() => addBlock('html')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-gold hover:text-gold text-stone-600 rounded-lg text-xs font-bold transition-all shadow-xxs cursor-pointer"
          >
            <Code size={14} />
            <span>+ HTML</span>
          </button>
          <button
            type="button"
            onClick={() => addBlock('true_false')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-gold hover:text-gold text-stone-600 rounded-lg text-xs font-bold transition-all shadow-xxs cursor-pointer"
          >
            <CheckSquare size={14} />
            <span>+ V / F</span>
          </button>
        </div>
      </div>

      {/* Listado de bloques creados */}
      <div className="space-y-6">
        {blocks && blocks.length > 0 ? (
          blocks.map((block, idx) => {
            return (
              <div 
                key={block.id} 
                className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-xxs p-5 relative group/block hover:border-gold/30 transition-all"
              >
                {/* Control de Bloque (Reordenar y eliminar) */}
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-700 pb-3 mb-4">
                  <span className="text-[10px] font-black uppercase bg-stone-100 text-stone-500 border border-stone-200 dark:border-stone-700 px-2 py-0.5 rounded-md tracking-widest">
                    {block.type === 'true_false' ? 'Verdadero / Falso' : block.type} Block #{idx + 1}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => moveBlock(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded disabled:opacity-30 cursor-pointer"
                      title="Subir bloque"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(idx, 'down')}
                      disabled={idx === blocks.length - 1}
                      className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded disabled:opacity-30 cursor-pointer"
                      title="Bajar bloque"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <div className="w-px h-4 bg-stone-200 mx-1"></div>
                    <button
                      type="button"
                      onClick={() => removeBlock(idx)}
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                      title="Eliminar bloque"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Contenido de bloque según tipo */}
                {block.type === 'text' && (
                  <div className="space-y-2">
                    <RichTextEditor 
                      content={(block.content as any).text || ''} 
                      onChange={(html: string) => updateBlockContent(idx, { text: html })}
                    />
                  </div>
                )}

                {block.type === 'image' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">URL de la Imagen</label>
                      <input 
                        type="url" 
                        required
                        value={(block.content as any).url || ''} 
                        onChange={(e) => updateBlockContent(idx, { url: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 focus:border-gold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Texto Alternativo (Alt)</label>
                      <input 
                        type="text" 
                        value={(block.content as any).alt || ''} 
                        onChange={(e) => updateBlockContent(idx, { alt: e.target.value })}
                        placeholder="Texto alternativo de la imagen"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 focus:border-gold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Alineación</label>
                      <select 
                        value={(block.content as any).alignment || 'center'} 
                        onChange={(e) => updateBlockContent(idx, { alignment: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 focus:border-gold outline-none bg-white dark:bg-stone-800"
                      >
                        <option value="left">Izquierda</option>
                        <option value="center">Centro</option>
                        <option value="right">Derecha</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Tamaño (Ancho)</label>
                      <select 
                        value={(block.content as any).size || 'medium'} 
                        onChange={(e) => updateBlockContent(idx, { size: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 focus:border-gold outline-none bg-white dark:bg-stone-800"
                      >
                        <option value="small">Pequeño</option>
                        <option value="medium">Mediano</option>
                        <option value="large">Grande</option>
                        <option value="full">Ancho Completo</option>
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Pie de foto (Caption)</label>
                      <input 
                        type="text" 
                        value={(block.content as any).caption || ''} 
                        onChange={(e) => updateBlockContent(idx, { caption: e.target.value })}
                        placeholder="Descripción al pie de la imagen..."
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 focus:border-gold outline-none"
                      />
                    </div>
                  </div>
                )}

                {block.type === 'question' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 font-bold">Pregunta</label>
                      <input 
                        type="text" 
                        required
                        value={(block.content as any).question || ''} 
                        onChange={(e) => updateBlockContent(idx, { question: e.target.value })}
                        placeholder="ej. ¿Qué es un grano peaberry?"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 focus:border-gold outline-none"
                      />
                    </div>
                    
                    <div className="space-y-2.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Opciones (Soporta dinámicas)</label>
                      {((block.content as any).options || []).map((option: string, optIdx: number) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name={`correct-${block.id}`}
                            checked={(block.content as any).correctAnswerIndex === optIdx}
                            onChange={() => updateBlockContent(idx, { correctAnswerIndex: optIdx })}
                            className="text-coffee dark:text-gold focus:ring-coffee"
                            title="Marcar como respuesta correcta"
                          />
                          <input 
                            type="text" 
                            required
                            value={option} 
                            onChange={(e) => {
                              const opts = [...(block.content as any).options];
                              opts[optIdx] = e.target.value;
                              updateBlockContent(idx, { options: opts });
                            }}
                            placeholder={`Opción ${optIdx + 1}`}
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 focus:border-gold outline-none"
                          />
                          {((block.content as any).options || []).length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                const opts = [...(block.content as any).options];
                                opts.splice(optIdx, 1);
                                // Ajustar respuesta correcta si se eliminó una antes
                                let correct = (block.content as any).correctAnswerIndex;
                                if (correct >= opts.length) correct = opts.length - 1;
                                updateBlockContent(idx, { options: opts, correctAnswerIndex: correct });
                              }}
                              className="p-1.5 text-stone-400 hover:text-red-500 rounded hover:bg-stone-50"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const opts = [...((block.content as any).options || []), ''];
                          updateBlockContent(idx, { options: opts });
                        }}
                        className="inline-flex items-center gap-1 text-[10px] text-coffee dark:text-gold hover:text-coffee dark:text-gold-dark font-bold hover:underline cursor-pointer"
                      >
                        <Plus size={10} /> Añadir opción
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Explicación Retroalimentación</label>
                      <textarea 
                        value={(block.content as any).explanation || ''} 
                        onChange={(e) => updateBlockContent(idx, { explanation: e.target.value })}
                        placeholder="Explica detalladamente por qué es la respuesta correcta para enseñar al lector..."
                        rows={2.5}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 focus:border-gold outline-none resize-none"
                      />
                    </div>
                  </div>
                )}

                {block.type === 'html' && (
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Código HTML Embebido (Iframe, Videos, Maps)</label>
                    <textarea 
                      required
                      value={(block.content as any).html || ''} 
                      onChange={(e) => updateBlockContent(idx, { html: e.target.value })}
                      placeholder="<iframe width='100%' height='315' src='https://www.youtube.com/embed/...'></iframe>"
                      rows={5}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 focus:border-gold outline-none font-mono"
                    />
                  </div>
                )}

                {block.type === 'true_false' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Enunciado / Afirmación</label>
                      <input 
                        type="text" 
                        required
                        value={(block.content as any).statement || ''} 
                        onChange={(e) => updateBlockContent(idx, { statement: e.target.value })}
                        placeholder="ej. El café tiene más antioxidantes que el té verde."
                        className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 focus:border-gold outline-none"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Opción Correcta</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer">
                          <input 
                            type="radio" 
                            name={`correct-tf-${block.id}`}
                            checked={(block.content as any).isTrue === true}
                            onChange={() => updateBlockContent(idx, { isTrue: true })}
                            className="text-coffee dark:text-gold focus:ring-coffee"
                          />
                          Verdadero
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer">
                          <input 
                            type="radio" 
                            name={`correct-tf-${block.id}`}
                            checked={(block.content as any).isTrue === false}
                            onChange={() => updateBlockContent(idx, { isTrue: false })}
                            className="text-coffee dark:text-gold focus:ring-coffee"
                          />
                          Falso
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Explicación Retroalimentación</label>
                      <textarea 
                        value={(block.content as any).explanation || ''} 
                        onChange={(e) => updateBlockContent(idx, { explanation: e.target.value })}
                        placeholder="Explica la realidad de la afirmación..."
                        rows={2.5}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 focus:border-gold outline-none resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-stone-800 border border-dashed border-stone-300 rounded-2xl py-12 text-center text-stone-400">
            <BookOpen className="h-10 w-10 mx-auto text-stone-300 mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider">No hay bloques en el artículo.</p>
            <p className="text-[10px] text-stone-400 mt-1">Usa los botones superiores para añadir textos, imágenes, preguntas interactivos, etc.</p>
          </div>
        )}
      </div>
    </div>
  );
}

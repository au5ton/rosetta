import React, { useEffect, useState } from 'react'

interface EditTranslationProps {
  initialText: string;
  targetElement: HTMLElement;
  initWidth: number;
  initHeight: number;
  onSave: (text:string, initialText:string, targetElement:HTMLElement) => void;
  onCancel: (initialText:string, targetElement:HTMLElement) => void;
}

export function EditTranslationComponent(props: EditTranslationProps) {
  const [text, setText] = React.useState(props.initialText);
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(30);

  const handleSave = () => {
    props.onSave(text, props.initialText, props.targetElement);
  };

  const handleCancel = () => {
    props.onCancel(props.initialText, props.targetElement);
  };

  const handleTextareaClick = (event:React.MouseEvent) => {
    event.stopPropagation();
  };

  useEffect(() => {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          props.onCancel(props.initialText, props.targetElement);
        }
    });

    setWidth(Math.max(width, props.initWidth));
    setHeight(Math.max(height, props.initHeight));

  }, []);

  return (
    <span>
        <textarea
            className="skiptranslate"
            style={{ width: `${width}px`, height: `${height}px` }}
            value={text}
            onClick={handleTextareaClick}
            onChange={(e) => setText(e.target.value)} />
        <button className="btn btn-primary skiptranslate" onClick={handleSave}>Save</button>
        <button className="btn btn-danger skiptranslate" onClick={handleCancel}>Cancel</button>
    </span>
  );
};

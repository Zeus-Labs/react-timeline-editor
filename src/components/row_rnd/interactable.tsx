import { DraggableOptions } from '@interactjs/actions/drag/plugin';
import { ResizableOptions } from '@interactjs/actions/resize/plugin';
import { DragEvent, Interactable } from '@interactjs/types';
import interact from 'interactjs';
import { cloneElement, ReactElement, useEffect, useRef, forwardRef } from 'react';

export const InteractComp = forwardRef<HTMLElement, {
  interactRef?: React.MutableRefObject<Interactable>;
  draggable: boolean;
  draggableOptions: DraggableOptions;
  resizable: boolean;
  resizableOptions: ResizableOptions;
  children: ReactElement;
}>(({ children, interactRef, draggable, resizable, draggableOptions, resizableOptions }, ref) => {
  const nodeRef = useRef<HTMLElement>();
  const interactable = useRef<Interactable>();
  const draggableOptionsRef = useRef<DraggableOptions>();
  const resizableOptionsRef = useRef<ResizableOptions>();

  useEffect(() => {
    draggableOptionsRef.current = { ...draggableOptions };
    resizableOptionsRef.current = { ...resizableOptions };
  }, [draggableOptions, resizableOptions]);

  useEffect(() => {
    if (!nodeRef.current) return;
    
    interactable.current && interactable.current.unset();
    interactable.current = interact(nodeRef.current);
    interactRef && (interactRef.current = interactable.current);
    setInteractions();
    
    return () => {
      interactable.current && interactable.current.unset();
    };
  }, [nodeRef.current, draggable, resizable]);

  const setInteractions = () => {
    if (!interactable.current) return;
    
    if (draggable)
      interactable.current.draggable({
        ...draggableOptionsRef.current,
        onstart: (e) => draggableOptionsRef.current.onstart && (draggableOptionsRef.current.onstart as (e: DragEvent) => any)(e),
        onmove: (e) => draggableOptionsRef.current.onmove && (draggableOptionsRef.current.onmove as (e: DragEvent) => any)(e),
        onend: (e) => draggableOptionsRef.current.onend && (draggableOptionsRef.current.onend as (e: DragEvent) => any)(e),
      });
    if (resizable)
      interactable.current.resizable({
        ...resizableOptionsRef.current,
        onstart: (e) => resizableOptionsRef.current.onstart && (resizableOptionsRef.current.onstart as (e: DragEvent) => any)(e),
        onmove: (e) => resizableOptionsRef.current.onmove && (resizableOptionsRef.current.onmove as (e: DragEvent) => any)(e),
        onend: (e) => resizableOptionsRef.current.onend && (resizableOptionsRef.current.onend as (e: DragEvent) => any)(e),
      });
  };

  // Use the forwarded ref if provided, otherwise use our internal ref
  const elementRef = (node) => {
    nodeRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  return cloneElement(children, {
    ref: elementRef,
    draggable: false,
  });
});

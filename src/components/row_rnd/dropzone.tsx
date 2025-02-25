import { Interactable } from '@interactjs/types';
import interact from 'interactjs';
import { cloneElement, ReactElement, useEffect, useRef, forwardRef } from 'react';
import { DropzoneOptions } from './dropzone_types';

export const DropzoneComp = forwardRef<HTMLElement, {
  dropzoneRef?: React.MutableRefObject<Interactable>;
  enabled: boolean;
  dropzoneOptions: DropzoneOptions;
  children: ReactElement;
}>(({ children, dropzoneRef, enabled, dropzoneOptions }, ref) => {
  const nodeRef = useRef<HTMLElement>();
  const interactable = useRef<Interactable>();
  const dropzoneOptionsRef = useRef<DropzoneOptions>();

  useEffect(() => {
    dropzoneOptionsRef.current = { ...dropzoneOptions };
  }, [dropzoneOptions]);

  // This effect runs when the nodeRef is set
  useEffect(() => {
    if (!nodeRef.current) return;

    interactable.current && interactable.current.unset();
    interactable.current = interact(nodeRef.current);
    dropzoneRef && (dropzoneRef.current = interactable.current);
    setInteractions();

    return () => {
      interactable.current && interactable.current.unset();
    };
  }, [nodeRef.current, enabled]);

  const setInteractions = () => {
    if (enabled && interactable.current) {
      interactable.current.dropzone({
        ondropactivate: (e) => dropzoneOptionsRef.current.ondropactivate && dropzoneOptionsRef.current.ondropactivate(e),
        ondropdeactivate: (e) => dropzoneOptionsRef.current.ondropdeactivate && dropzoneOptionsRef.current.ondropdeactivate(e),
        ondragenter: (e) => dropzoneOptionsRef.current.ondragenter && dropzoneOptionsRef.current.ondragenter(e),
        ondragleave: (e) => dropzoneOptionsRef.current.ondragleave && dropzoneOptionsRef.current.ondragleave(e),
        ondropmove: (e) => dropzoneOptionsRef.current.ondropmove && dropzoneOptionsRef.current.ondropmove(e),
        ondrop: (e) => dropzoneOptionsRef.current.ondrop && dropzoneOptionsRef.current.ondrop(e),
      });
    }
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
  });
});

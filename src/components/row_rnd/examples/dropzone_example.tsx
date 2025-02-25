import React, { useRef, useState } from 'react';
import { RowDnd } from '../row_rnd';
import { RowRndApi } from '../row_rnd_interface';
import { DropzoneEvent } from '../dropzone_types';
import { useDropzone } from '../hooks/useDropzone';

const DraggableItem: React.FC<{ id: string; initialLeft: number; initialWidth: number }> = ({ id, initialLeft, initialWidth }) => {
  const itemRef = useRef<RowRndApi>(null);
  const [position, setPosition] = useState({ left: initialLeft, width: initialWidth });

  const handleDragEnd = (data: { left: number; width: number; top: number }) => {
    setPosition({ left: data.left, width: data.width });
  };

  return (
    <RowDnd
      ref={itemRef}
      left={position.left}
      width={position.width}
      enableDragging={true}
      enableResizing={true}
      onDragEnd={handleDragEnd}
      grid={10}
      bounds={{ left: 0, right: 1000 }}
    >
      <div
        style={{
          position: 'absolute',
          height: 50,
          backgroundColor: '#3498db',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          cursor: 'move',
        }}
        data-id={id}
      >
        Draggable Item {id}
      </div>
    </RowDnd>
  );
};

const DropzoneArea: React.FC = () => {
  const [activeDropzone, setActiveDropzone] = useState(false);
  const [droppedItems, setDroppedItems] = useState<string[]>([]);
  
  const handleDrop = (event: DropzoneEvent) => {
    const itemId = event.relatedTarget.getAttribute('data-id');
    if (itemId && !droppedItems.includes(itemId)) {
      setDroppedItems([...droppedItems, itemId]);
    }
  };

  const handleDragEnter = () => {
    setActiveDropzone(true);
  };

  const handleDragLeave = () => {
    setActiveDropzone(false);
  };

  const { dropzoneOptions } = useDropzone({
    accept: '[data-id]',
    overlap: 'pointer',
    onDrop: handleDrop,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
  });

  return (
    <div style={{ padding: 20 }}>
      <h2>Dropzone Example</h2>
      
      <div style={{ display: 'flex', marginBottom: 20 }}>
        <div style={{ flex: 1, position: 'relative', height: 200 }}>
          <DraggableItem id="item1" initialLeft={50} initialWidth={150} />
          <DraggableItem id="item2" initialLeft={250} initialWidth={150} />
          <DraggableItem id="item3" initialLeft={450} initialWidth={150} />
        </div>
      </div>
      
      <div
        style={{
          width: '100%',
          height: 200,
          border: '2px dashed #ccc',
          borderRadius: 8,
          backgroundColor: activeDropzone ? 'rgba(52, 152, 219, 0.1)' : 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.3s',
        }}
      >
        <RowDnd
          enableDragging={false}
          enableResizing={false}
          enableDropzone={true}
          dropzoneOptions={dropzoneOptions}
        >
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {droppedItems.length === 0 ? (
              <p>Drop items here</p>
            ) : (
              <>
                <p>Dropped items:</p>
                <ul>
                  {droppedItems.map((id) => (
                    <li key={id}>Item {id}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </RowDnd>
      </div>
    </div>
  );
};

export default DropzoneArea;

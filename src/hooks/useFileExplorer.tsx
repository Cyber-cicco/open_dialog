import { open } from '@tauri-apps/plugin-dialog';

interface UseFileExplorerReturn {
  openImagePicker: () => Promise<string | null>;
}

export const useFileExplorer = (): UseFileExplorerReturn => {
  const openImagePicker = async (): Promise<string | null> => {
    const selected = await open({
      multiple: false,
      filters: [{
        name: 'Images',
        extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp']
      }]
    });
    
    return typeof selected === 'string' ? selected : null;
  };

  return { openImagePicker };
};

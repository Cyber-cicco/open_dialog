import { convertFileSrc } from '@tauri-apps/api/core';
import { Project } from '../../bindings/Project';

/** Converts a stored image filename to a displayable src URL */
export function getImageSrc(project: Project, fileName: string | undefined | null): string | null {
  if (!fileName) return null
  const fullPath = `${project.path}/assets/${fileName}`
  return convertFileSrc(fullPath)
}

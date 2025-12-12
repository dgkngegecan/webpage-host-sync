import { v4 as uuidv4 } from 'uuid';

export function generateStorageKey(folder: string, originalName: string, date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    // Sanitize filename: remove special chars, spaces to underscores, keep extension
    const ext = originalName.split('.').pop() || '';
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '_');

    // UUID for uniqueness
    const uuid = uuidv4();

    return `${folder}/${year}/${month}/${uuid}-${sanitizedName}.${ext}`;
}

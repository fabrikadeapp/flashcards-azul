import fs from 'fs';
import path from 'path';

const settingsFilePath = path.join(process.cwd(), 'data', 'settings.json');

export interface AppSettings {
    allowFlashcardEditing: boolean;
}

export function getSettings(): AppSettings {
    try {
        if (!fs.existsSync(settingsFilePath)) {
            return { allowFlashcardEditing: false };
        }
        const data = fs.readFileSync(settingsFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler settings.json:', error);
        return { allowFlashcardEditing: false };
    }
}

export function saveSettings(settings: AppSettings) {
    try {
        if (!fs.existsSync(path.dirname(settingsFilePath))) {
            fs.mkdirSync(path.dirname(settingsFilePath), { recursive: true });
        }
        fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
    } catch (error) {
        console.error('Erro ao salvar settings.json:', error);
    }
}

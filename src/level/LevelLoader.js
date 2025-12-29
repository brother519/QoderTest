export class LevelLoader {
    static async loadLevel(levelPath) {
        try {
            const response = await fetch(levelPath);
            if (!response.ok) {
                throw new Error(`Failed to load level: ${levelPath}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error loading level:', error);
            return null;
        }
    }
}

export default LevelLoader;

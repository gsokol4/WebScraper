import { writeFile } from 'fs/promises';

async function writeJSON(filePath, data) {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    await writeFile(filePath, jsonData, 'utf-8');
    console.log(`Data successfully written to ${filePath}`);
  } catch (err) {
    console.error('Error writing JSON:', err);
  }
}

export default writeJSON;

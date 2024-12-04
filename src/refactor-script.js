import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utility function to traverse files recursively
function traverseDir(dir, callback) {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.lstatSync(filePath).isDirectory()) {
      traverseDir(filePath, callback);
    } else if (filePath.endsWith(".vue")) {
      callback(filePath);
    }
  });
}

// Function to refactor a single file
function refactorFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  let originalContent = content; // Store original content to compare later
  let hasChanges = false;

  console.log(content);

  // Look for <script setup> tag and its position
  const scriptSetupRegex = /<script(\s+lang="ts")?\s+setup(\s+lang="ts")?>/;
  const scriptSetupStart = content.search(scriptSetupRegex);
  const scriptSetupEnd = content.indexOf("</script>", scriptSetupStart);

  // Check if <script setup> exists
  if (scriptSetupStart === -1 || scriptSetupEnd === -1) {
    console.warn(`Warning: No <script setup> found in ${filePath}`);
    return;
  }

  // Extract the content of the <script setup> block
  const scriptContent = content.slice(scriptSetupStart, scriptSetupEnd);
  console.log(scriptContent, "scriptContent", filePath);

  // Refactor $vuetify.theme -> theme, theme.current.value
  if (content.includes("$vuetify.theme")) {
    console.log(`Refactoring $vuetify.theme in ${filePath}`);

    if (!scriptContent.includes("useTheme")) {
      // Insert useTheme import if not present
      const importStatement =
        '\nimport { useTheme } from "vuetify/lib/framework.mjs";\nconst theme = useTheme();\n';
      content = insertInScriptSetup(content, scriptSetupStart, importStatement);
    }

    // Replace $vuetify.theme.current with theme.current.value
    content = content.replace(
      /\$vuetify\.theme\.current/g,
      "theme.current.value"
    );
    // Replace $vuetify.theme with theme
    content = content.replace(/\$vuetify\.theme/g, "theme");
    hasChanges = true;
  }

  // Refactor $user -> userStore, useUserStore import
  if (content.includes("$user")) {
    console.log(`Refactoring $user in ${filePath}`);

    if (!scriptContent.includes("useUserStore")) {
      // Insert useUserStore import if not present
      const importStatement =
        '\nimport { useUserStore } from "@/store/user.store";\nconst userStore = useUserStore();\n';
      content = insertInScriptSetup(content, scriptSetupStart, importStatement);
    }

    // Replace $user with userStore
    content = content.replace(/\$user/g, "userStore");
    hasChanges = true;
  }

  // If changes were made, write the new content to the file
  if (hasChanges && content !== originalContent) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`File modified: ${filePath}`);
  } else if (!hasChanges) {
    console.log(`No changes made to ${filePath}`);
  }
}

// Utility function to insert text within the <script setup> block
function insertInScriptSetup(content, scriptSetupStart, line) {
  // Find the position right after <script setup> to insert the imports
  const insertPosition = scriptSetupStart + "<script setup>".length;
  return (
    content.slice(0, insertPosition) + line + content.slice(insertPosition)
  );
}

// Main function to traverse directory and refactor all .vue files
function refactorVueFiles(directory) {
  traverseDir(directory, refactorFile);
}

// Example usage: pass the path to your Vue project root directory
const vueProjectRoot = path.join(__dirname, "."); // Adjust as necessary
refactorVueFiles(vueProjectRoot);

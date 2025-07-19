#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get the new version from command line arguments
const newVersion = process.argv[2];

if (!newVersion) {
  console.error('Usage: node scripts/update-version.js <version>');
  process.exit(1);
}

console.log(`🔄 Updating version to ${newVersion}...`);

// Files that need version updates
const filesToUpdate = [
  {
    path: 'package.json',
    type: 'json',
    key: 'version'
  },
  {
    path: 'api/package.json',
    type: 'json',
    key: 'version'
  },
  {
    path: 'web-app/package.json',
    type: 'json',
    key: 'version'
  },
  {
    path: 'api/src/index.js',
    type: 'js',
    pattern: /version: process\.env\.npm_package_version \|\| '([^']+)'/,
    replacement: `version: process.env.npm_package_version || '${newVersion}'`
  }
];

// Update each file
filesToUpdate.forEach(file => {
  try {
    const filePath = path.join(process.cwd(), file.path);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${file.path}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    if (file.type === 'json') {
      const json = JSON.parse(content);
      const oldVersion = json[file.key];
      json[file.key] = newVersion;
      content = JSON.stringify(json, null, 2);
      updated = oldVersion !== newVersion;
      console.log(`✅ Updated ${file.path}: ${oldVersion} → ${newVersion}`);
    } else if (file.type === 'js') {
      const oldMatch = content.match(file.pattern);
      if (oldMatch) {
        const oldVersion = oldMatch[1];
        content = content.replace(file.pattern, file.replacement);
        updated = oldVersion !== newVersion;
        console.log(`✅ Updated ${file.path}: ${oldVersion} → ${newVersion}`);
      }
    }

    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  } catch (error) {
    console.error(`❌ Error updating ${file.path}:`, error.message);
  }
});

// Update version in documentation files
const docsToUpdate = [
  'docs/API.md',
  'SPRINT_1_COMPLETION.md'
];

docsToUpdate.forEach(docPath => {
  try {
    const filePath = path.join(process.cwd(), docPath);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${docPath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update version references in documentation
    const versionPatterns = [
      /"version": "([^"]+)"/g,
      /version: "([^"]+)"/g,
      /Version: ([^\n]+)/g
    ];

    let updated = false;
    versionPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, (match, oldVersion) => {
          if (oldVersion !== newVersion) {
            updated = true;
            return match.replace(oldVersion, newVersion);
          }
          return match;
        });
      }
    });

    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated version references in ${docPath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${docPath}:`, error.message);
  }
});

console.log(`🎉 Version update complete! All files updated to ${newVersion}`); 
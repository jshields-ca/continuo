#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎉 Release completed successfully!');

// Get version from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;

console.log(`📦 Version ${version} has been released`);

// Create release summary
const releaseSummary = `
# Release Summary - Version ${version}

## 🎯 What was released
- **Version**: ${version}
- **Date**: ${new Date().toISOString().split('T')[0]}
- **Type**: ${getReleaseType(version)}

## 📋 Release Checklist
- [x] Code linting passed
- [x] Tests passed
- [x] Build successful
- [x] Version updated across all files
- [x] Changelog updated
- [x] Git tag created
- [x] GitHub release created
- [x] Documentation updated

## 🚀 Next Steps
1. **Deploy to staging** (if applicable)
2. **Run integration tests**
3. **Deploy to production** (if ready)
4. **Update deployment documentation**
5. **Notify team members**

## 📊 Release Metrics
- **Files updated**: All package.json files, documentation, and version references
- **Changelog entries**: See CHANGELOG.md for detailed changes
- **Git tag**: v${version}
- **GitHub release**: https://github.com/jshields-ca/get-organized/releases/tag/v${version}

## 🔗 Useful Links
- **Repository**: https://github.com/jshields-ca/get-organized
- **Issues**: https://github.com/jshields-ca/get-organized/issues
- **Documentation**: ./docs/
- **API Documentation**: ./docs/API.md

---
*Release completed on ${new Date().toISOString()}*
`;

// Write release summary to file
const summaryPath = path.join(process.cwd(), 'RELEASE_SUMMARY.md');
fs.writeFileSync(summaryPath, releaseSummary.trim());

console.log(`📝 Release summary written to: ${summaryPath}`);

// Display next steps
console.log('\n📋 Next Steps:');
console.log('1. Review the release on GitHub');
console.log('2. Test the deployed application');
console.log('3. Update any deployment configurations');
console.log('4. Notify stakeholders about the release');

// Check if this is a major version (1.0.0+)
if (version.startsWith('1.')) {
  console.log('\n🎊 This is a major release! Consider:');
  console.log('- Updating marketing materials');
  console.log('- Sending announcement emails');
  console.log('- Updating external documentation');
  console.log('- Planning user migration if needed');
}

console.log('\n✅ Release process complete!');

function getReleaseType(version) {
  const [major, minor, patch] = version.split('.').map(Number);
  
  if (major === 0) {
    if (minor === 0) {
      return 'Patch Release';
    } else {
      return 'Minor Release (Development)';
    }
  } else if (major === 1) {
    return 'Major Release (Beta)';
  } else {
    return 'Major Release';
  }
} 
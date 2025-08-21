module.exports = {
  // Lint and format JavaScript/TypeScript files
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'jest --bail --findRelatedTests --passWithNoTests',
  ],
  
  // Format other files
  '*.{json,md,yml,yaml}': ['prettier --write'],
  
  // Type check TypeScript files
  '*.{ts,tsx}': () => 'tsc --noEmit',
  
  // Security audit for package files
  'package*.json': ['npm audit --audit-level=moderate'],
}; 
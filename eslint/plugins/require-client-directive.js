const path = require('path');

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce \'use client\' directive in pages that use useAuth()',
      recommended: true,
    },
    messages: {
      missingUseClient: "Pages using 'useAuth()' must include 'use client' directive at the top of the file.",
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();
    const isPageFile = /(\/|\\)app(\/|\\)(.*?)(\/|\\)page\.(js|jsx|ts|tsx)$/.test(filename);
    
    if (!isPageFile) {
      return {}; // Not a page file, skip
    }

    let hasUseClient = false;
    let hasUseAuth = false;
    let useAuthNode = null;

    return {
      // Check for 'use client' directive
      Program(node) {
        const firstNode = node.body[0];
        hasUseClient = firstNode && 
                      firstNode.type === 'ExpressionStatement' &&
                      firstNode.expression.type === 'Literal' &&
                      firstNode.expression.value === 'use client';
      },

      // Check for useAuth() usage
      CallExpression(node) {
        if (node.callee.name === 'useAuth') {
          hasUseAuth = true;
          useAuthNode = node;
        }
      },

      // Final check after parsing the file
      'Program:exit'() {
        if (hasUseAuth && !hasUseClient) {
          context.report({
            node: useAuthNode,
            messageId: 'missingUseClient',
            fix(fixer) {
              return fixer.insertTextBefore(
                context.getSourceCode().ast,
                "'use client';\n\n"
              );
            },
          });
        }
      },
    };
  },
};

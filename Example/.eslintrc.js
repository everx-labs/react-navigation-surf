module.exports = {
    root: true,
    extends: [
        '@react-native-community',
        'airbnb',
        'plugin:flowtype/recommended',
    ],
    plugins: ['flowtype', 'detox'],
    rules: {
        'react/jsx-indent-props': [1, 4],
        'react/jsx-indent': ['error', 4],
        indent: ['error', 4, { SwitchCase: 1 }],
        'no-use-before-define': ['error', { variables: false }],
        'arrow-body-style': 'off',
        'arrow-parens': ['error', 'as-needed'],
        'no-console': 'off',
        'no-continue': 'off',
        'jsx-a11y/href-no-hash': 'off',
        'object-curly-newline': 'off',
        'import/prefer-default-export': 'off',
        'import/no-cycle': [2, { maxDepth: 1 }],
        'function-paren-newline': ['error', 'consistent'],
        'jsx-a11y/anchor-is-valid': [
            'warn',
            {
                aspects: ['invalidHref'],
            },
        ],
        'flowtype/space-after-type-colon': 'off',
        'quote-props': 'off',
    },
};

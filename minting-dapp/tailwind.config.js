const colors = require('tailwindcss/colors');

module.exports = {
    mode: 'jit',
    content: [
        './src/**/*.tsx',
        './public/index.html',
    ],
    theme: {
        extend: {
            colors: {
                popupsbg: colors.white,
                neutral: colors.slate,
                primary: colors.indigo,
                primarytxt: colors.white,
                warning: colors.yellow,
                warningtxt: colors.black,
                error: colors.red,
                errortxt: colors.white,
                appbg:"rgba(12, 26, 17, 0.7)"
            },
        },
    },
    variants: {},
    plugins: [],
};

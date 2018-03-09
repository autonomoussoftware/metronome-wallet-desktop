const darkShade = 'rgba(0, 0, 0, 0.2)'

export default {
  colors: {
    primary: '#7e61f8',
    translucentPrimary: 'rgba(126, 97, 248, 0.2)',
    light: '#fff',
    copy: '#545454',
    dark: '#323232',
    lightShade: 'rgba(0, 0, 0, 0.1)',
    darkShade,
    success: '#45d48d',
    danger: '#d46045',

    // BACKGROUNDS
    bg: {
      primary: '#7e61f8',
      dark: '#323232',
      medium: '#f4f4f4',
      light: '#ededed',
      white: '#fff',
      darkGradient: 'linear-gradient(to bottom, #353535, #323232)'
    }
  },

  textShadow: `0 1px 1px ${darkShade}`,
  spacing: 0.8 // used as rem multiplier
}

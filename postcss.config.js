module.exports = {
  plugins: [
    require('postcss-reporter')({
      filter: (message) => {
        // Bỏ qua cảnh báo liên quan đến "successive traversals"
        return !message.text.includes('Did not expect successive traversals');
      }
    })
  ]
};

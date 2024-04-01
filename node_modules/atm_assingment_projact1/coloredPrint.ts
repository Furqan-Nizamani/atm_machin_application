export const colors = {
    reset: "\x1b[0m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    orange: "\x1b[38;5;208m", // ANSI escape code for orange color
  };
  
  export const printColoredMessage = (
    message: string,
    color?: keyof typeof colors
  ): void => {
    //keyof typeof colors: This is an indexed type query, which extracts all the keys of the type
    if (color) {
      console.log(`${colors[color]}${message}${colors.reset}`);
    }else{
      console.log(`${colors.orange}${message}${colors.reset}`);
    }
  };
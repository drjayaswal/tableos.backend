export const generateRandomLabel = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randomChar = letters.charAt(Math.floor(Math.random() * letters.length));
    const randomNum = Math.floor(Math.random() * 100);
    return `Table-${randomChar}${randomNum}`;
};
const bcrypt = require('bcrypt');

const BCRYPT_SALT_ROUNDS = 12;

export class encrypt {
    async encryptPassword(data: any) {
        const encryptData = await bcrypt.hash(data, BCRYPT_SALT_ROUNDS);
        return encryptData;
    }

    async encryptCompare(data: any, data2: any) {
        const compare = await bcrypt.compare(data, data2);
        return compare;
    }
}

export function generatePassword() {
    const list = ['hola', 'adios', 'casa', 'perro', 'gato', 'call', 'ave', 'calle', 'callejon', 'callejuela', 'callejonada', 'callejoncillo', 'cuchillo', 'tenedor', 'cuchara', 'cucharilla', 'cucharada', 'cucharadita']
    const randomWord = Math.floor(Math.random() * (list.length - 0)) + 0;

    const listNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
    const randomNumbers = Math.floor(Math.random() * (listNumbers.length - 0)) + 0;

    const symbols = ['!', '@', '#', '$', '%', '&', '*', '(', ')', '-', '_', '+', '=']
    const randomSymbols = Math.floor(Math.random() * (symbols.length - 0)) + 0;
    

    const password = list[randomWord] + listNumbers[randomNumbers] + symbols[randomSymbols];
    return password;
    
}

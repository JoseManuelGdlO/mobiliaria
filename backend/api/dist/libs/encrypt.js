"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = void 0;
exports.generatePassword = generatePassword;
const bcrypt = require('bcrypt');
const BCRYPT_SALT_ROUNDS = 12;
class encrypt {
    encryptPassword(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const encryptData = yield bcrypt.hash(data, BCRYPT_SALT_ROUNDS);
            return encryptData;
        });
    }
    encryptCompare(data, data2) {
        return __awaiter(this, void 0, void 0, function* () {
            const compare = yield bcrypt.compare(data, data2);
            return compare;
        });
    }
}
exports.encrypt = encrypt;
function generatePassword() {
    const list = ['hola', 'adios', 'casa', 'perro', 'gato', 'call', 'ave', 'calle', 'callejon', 'callejuela', 'callejonada', 'callejoncillo', 'cuchillo', 'tenedor', 'cuchara', 'cucharilla', 'cucharada', 'cucharadita'];
    const randomWord = Math.floor(Math.random() * (list.length - 0)) + 0;
    const listNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    const randomNumbers = Math.floor(Math.random() * (listNumbers.length - 0)) + 0;
    const symbols = ['!', '@', '#', '$', '%', '&', '*', '(', ')', '-', '_', '+', '='];
    const randomSymbols = Math.floor(Math.random() * (symbols.length - 0)) + 0;
    const password = list[randomWord] + listNumbers[randomNumbers] + symbols[randomSymbols];
    return password;
}

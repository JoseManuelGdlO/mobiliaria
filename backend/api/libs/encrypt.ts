const bcrypt = require('bcrypt');

const BCRYPT_SALT_ROUNDS = 12;

export async function encryptPassword(data: any) {
    const encryptData = await bcrypt.hash(data, BCRYPT_SALT_ROUNDS);
    return encryptData;
}

export async function encryptCompare(data: any, data2: any) {
    const compare = await bcrypt.compare(data, data2);
    return compare;
}

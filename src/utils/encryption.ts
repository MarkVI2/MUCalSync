import CryptoJS from "crypto-js";

export const encryptData = (data: any, key: string) => {
  if (!key) {
    throw new Error("Encryption key is required");
  }

  // Ensure the key is properly formatted for AES
  const formattedKey = CryptoJS.enc.Utf8.parse(key);

  return CryptoJS.AES.encrypt(JSON.stringify(data), formattedKey, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
};

export const decryptData = (encryptedData: string, key: string) => {
  if (!key) {
    throw new Error("Encryption key is required");
  }

  const formattedKey = CryptoJS.enc.Utf8.parse(key);

  const bytes = CryptoJS.AES.decrypt(encryptedData, formattedKey, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

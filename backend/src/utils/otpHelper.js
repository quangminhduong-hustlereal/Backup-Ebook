import otpGenerator from 'otp-generator';

export const generateOTP = () => {
    return otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
    });
};

export const generateOtpExpiry = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now;
};

export const isOtpExpired = (expiryTime) => {
    if (!expiryTime) return true;
    return new Date() > expiryTime;
};

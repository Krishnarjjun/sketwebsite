// const MSG91_BASE_URL = 'https://control.msg91.com/api/v5/otp';

// function getConfig() {
//   const authKey = process.env.MSG91_AUTHKEY;
//   const templateId = process.env.MSG91_TEMPLATE_ID;
//   const otpLength = Number(process.env.MSG91_OTP_LENGTH || 6);
//   const expiryMinutes = Number(process.env.MSG91_OTP_EXPIRY_MINUTES || 10);

//   if (!authKey || authKey === 'YOUR_MSG91_AUTHKEY') {
//     throw new Error('MSG91_AUTHKEY is not configured on the server.');
//   }

//   if (!templateId || templateId === 'YOUR_MSG91_TEMPLATE_ID') {
//     throw new Error('MSG91_TEMPLATE_ID is not configured on the server.');
//   }

//   if (![4, 5, 6].includes(otpLength)) {
//     throw new Error('MSG91_OTP_LENGTH must be 4, 5 or 6.');
//   }

//   return { authKey, templateId, otpLength, expiryMinutes };
// }

// function assertResponseBody(body) {
//   const type = String(body?.type || '').toLowerCase();
//   const message = String(body?.message || '').toLowerCase();

//   if (type === 'success') return;

//   throw new Error(body?.message || 'MSG91 rejected the OTP request.');
// }

// async function sendOtp(phone) {
//   const { authKey, templateId, otpLength, expiryMinutes } = getConfig();

//   const params = new URLSearchParams({
//     template_id: templateId,
//     mobile: phone,
//     otp_length: String(otpLength),
//     otp_expiry: String(expiryMinutes)
//   });

//   const response = await fetch(`${MSG91_BASE_URL}?${params.toString()}`, {
//     method: 'POST',
//     headers: {
//       accept: 'application/json',
//       authkey: authKey,
//       'content-type': 'application/json'
//     },
//     body: JSON.stringify({})
//   });

//   const body = await response.json().catch(() => ({}));

//   if (!response.ok) {
//     throw new Error(body?.message || `MSG91 SendOTP failed with HTTP ${response.status}.`);
//   }

//   assertResponseBody(body);

//   return {
//     message: body?.message || 'OTP sent successfully',
//     requestId: body?.request_id || body?.requestId || null
//   };
// }

// async function verifyOtp(phone, otp) {
//   const authKey = process.env.MSG91_AUTHKEY;

//   if (!authKey || authKey === 'YOUR_MSG91_AUTHKEY') {
//     throw new Error('MSG91_AUTHKEY is not configured on the server.');
//   }

//   const params = new URLSearchParams({
//     mobile: phone,
//     otp
//   });

//   const response = await fetch(`${MSG91_BASE_URL}/verify?${params.toString()}`, {
//     method: 'GET',
//     headers: {
//       accept: 'application/json',
//       authkey: authKey
//     }
//   });

//   const body = await response.json().catch(() => ({}));
//   const message = String(body?.message || '').toLowerCase();

//   if (!response.ok) {
//     return { verified: false, message: body?.message || `MSG91 returned HTTP ${response.status}.` };
//   }

//   return {
//     verified: message.includes('otp verified success') || String(body?.type || '').toLowerCase() === 'success',
//     message: body?.message || 'OTP verification completed.'
//   };
// }

// module.exports = {
//   sendOtp,
//   verifyOtp
// };

// --------------------------------------------------------------------------------------------------------------------------------------------------------------








const MSG91_BASE_URL = 'https://control.msg91.com/api/v5/otp';

// Development OTP settings
const DEV_OTP = process.env.DEV_OTP || '123456';

function isDevelopmentMode() {
  return (
    process.env.OTP_MODE === 'development' ||
    process.env.NODE_ENV === 'development'
  );
}

function getConfig() {
  const authKey = process.env.MSG91_AUTHKEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  const otpLength = Number(process.env.MSG91_OTP_LENGTH || 6);
  const expiryMinutes = Number(
    process.env.MSG91_OTP_EXPIRY_MINUTES || 10
  );

  if (!authKey || authKey === 'YOUR_MSG91_AUTHKEY') {
    throw new Error('MSG91_AUTHKEY is not configured on the server.');
  }

  if (!templateId || templateId === 'YOUR_MSG91_TEMPLATE_ID') {
    throw new Error('MSG91_TEMPLATE_ID is not configured on the server.');
  }

  if (![4, 5, 6].includes(otpLength)) {
    throw new Error('MSG91_OTP_LENGTH must be 4, 5 or 6.');
  }

  return {
    authKey,
    templateId,
    otpLength,
    expiryMinutes
  };
}

/**
 * Send OTP
 */
async function sendOtp(phone) {
  // DEVELOPMENT MODE
  if (isDevelopmentMode()) {
    console.log(
      `[DEV OTP] OTP for ${phone}: ${DEV_OTP}`
    );

    return {
      success: true,
      development: true,
      message: 'Development OTP generated successfully.'
    };
  }

  // PRODUCTION / MSG91 MODE
  const {
    authKey,
    templateId,
    otpLength,
    expiryMinutes
  } = getConfig();

  const params = new URLSearchParams({
    template_id: templateId,
    mobile: phone,
    otp_length: String(otpLength),
    otp_expiry: String(expiryMinutes)
  });

  const response = await fetch(
    `${MSG91_BASE_URL}?${params.toString()}`,
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        authkey: authKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({})
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message ||
      result.error ||
      `MSG91 Send OTP failed with status ${response.status}`
    );
  }

  return result;
}

/**
 * Verify OTP
 */
async function verifyOtp(phone, otp) {
  // DEVELOPMENT MODE
  if (isDevelopmentMode()) {
    console.log(
      `[DEV OTP] Verifying OTP for ${phone}: ${otp}`
    );

      if (String(otp) === String(DEV_OTP)) {
  return {
    success: true,
    verified: true,
    development: true,
    message: 'OTP verified successfully.'
  };
}

    throw new Error('Invalid development OTP.');
  }

  // PRODUCTION / MSG91 MODE
  const authKey = process.env.MSG91_AUTHKEY;

  if (!authKey || authKey === 'YOUR_MSG91_AUTHKEY') {
    throw new Error('MSG91_AUTHKEY is not configured on the server.');
  }

  const params = new URLSearchParams({
    mobile: phone,
    otp: String(otp)
  });

  const response = await fetch(
    `${MSG91_BASE_URL}/verify?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        authkey: authKey
      }
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message ||
      result.error ||
      `MSG91 Verify OTP failed with status ${response.status}`
    );
  }

  return result;
}

module.exports = {
  sendOtp,
  verifyOtp
};

import http from "./http";

/* ================= SEND OTP ================= */
export const sendForgotPasswordOtp = async (email) => {
  const { data } = await http.post(
    "/users/user-forgot-password/",
    { email },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return data;
};

/* ================= VERIFY OTP ================= */
export const verifyForgotPasswordOtp = async (email, otp) => {
  const { data } = await http.post(
    "/users/user-verify-otp-forgot-password/",
    {
      email,
      otp,
    }
  );

  return data;
};

/* ================= RESET PASSWORD ================= */
export const resetPassword = async (
  email,
  newPassword,
  confirmPassword
) => {
  const { data } = await http.post(
    "/users/user-set-password/",
    {
      email,
      new_password: newPassword,
      confirm_password: confirmPassword,
    }
  );

  return data;
};

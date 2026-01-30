import FormInput from "../../../../shared/FormInputs";
import FormButton from "../../../../shared/FormButton";
import AuthModal from "../../../../shared/AuthModal";
import { useState, useContext } from "react";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import google from "../../../../assets/images/googleIcon.svg";
import appleIcon from "../../../../assets/images/appleIcon.svg";
import facebookIcon from "../../../../assets/images/facebook.svg";
import twitterIcon from "../../../../assets/images/twitter.svg";
import * as Yup from "yup";
import { VerifyContext } from "../../../../app/VerifyContext";
import Button from "../../../../shared/Button";

const formSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid Email address")
    .required("Email is required"),
  password: Yup.string()
    .min(2, "Password must be 2 characters at minimum")
    .required("Password is required"),
});


export default function LoginPage() {
  const navigate = useNavigate();
  const { loginUser } = useContext(VerifyContext);

  const [loginError, setLoginError] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  

  const googleButtonsClasses =
    "bg-white px-2 md:px-5 py-2 rounded-[10px] w-full h-10 text-black-600 font-inter text-sm leading-6 justify-center flex items-center justify-center outline-none border-none gap-3.5";

  const handleSubmit = async (
    values: { email: string; password: string },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    setLoginError("");
    if (!isChecked) {
      setLoginError("Please agree to the Terms and Privacy Policy.");
      setSubmitting(false);
      return;
    }
    const result = await loginUser(values.email, values.password);
    if (result.success) {
      navigate("/");
    } else {
      setLoginError(
        result.message || "Login failed. Please check your credentials."
      );
    }
    setSubmitting(false);
  };

  const handleChange = () => {
    setIsChecked(!isChecked);
  };

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: formSchema,
    onSubmit: handleSubmit,
  });

  return (
    <AuthModal modalClassName="max-w-[400px] mx-auto p-7 w-full max-h-fit rounded-[13px]">
      <h1 className="font-poppins text-xl md:text-2xl text-left leading-normal md:leading-[33.33px] font-semibold text-white m-0">
        Login
      </h1>

      <p className="mt-2.5 font-inter font-medium text-sm text-white-600 text-left leading-5">
        Don’t have an account?{" "}
        <Link to="/signup" className="text-[#259DA8]">
          Register here
        </Link>
      </p>
      <div className="flex flex-col mt-[26px] gap-3.5 w-full">
        <Button buttonClasses={googleButtonsClasses}>
          <img src={google} alt="google" className="w-4 h-4" />
          Continue with Google
        </Button>
        <Button buttonClasses={googleButtonsClasses}>
          <img src={appleIcon} alt="Apple" className="w-4 h-4" />
          Continue with Apple
        </Button>
        <Button buttonClasses={`${googleButtonsClasses} !bg-blue-800 !text-white`}>
          <img src={facebookIcon} alt="FaceBook" className="w-4 h-4" />
          Continue with Facebook
        </Button>
        <Button buttonClasses={`${googleButtonsClasses} !bg-[#1DA1F2] !text-white`}>
          <img src={twitterIcon} alt="Twitter" className="w-4 h-4" />
          Continue with Facebook
        </Button>
      </div>
      <div className="my-[26px] flex justify-center py-[9px] gap-[13px] items-center w-full">
        <div className="border-t border-solid border-[#FFFFFF21] w-full"></div>
        <p className="m-0 text-[#FFFFFF21] font-inter text-[11px] font-medium">
          or
        </p>
        <div className="border-t border-solid border-[#FFFFFF21] w-full"></div>
      </div>

      <form
        onSubmit={formik.handleSubmit}
        className="flex flex-col font-inter"
        noValidate
      >
        <div className="relative mb-[13px]">
          <FormInput
            label=""
            type="email"
            id="email"
            name="email"
            placeholder="Email address"
            onChange={formik.handleChange}
            value={formik.values.email}
            labelClassName={undefined}
            inputClassName="border border-solid border-[#FFFFFF21] bg-[#FFFFFF08] py-2.5 px-[13px] font-inter text-xs font-medium leading-5 text-[#FFFFFF52] rounded-[10px]"
          />
          {formik.errors.email && formik.touched.email && (
            <p className="text-red-500 text-[8px] mt-1 absolute -bottom-3">
              {formik.errors.email}
            </p>
          )}
        </div>
        <div className="relative">
          <FormInput
            label=""
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            onChange={formik.handleChange}
            value={formik.values.password}
            labelClassName={undefined}
            inputClassName="border border-solid border-[#FFFFFF21] bg-[#FFFFFF08] py-2.5 px-[13px] font-inter text-xs font-medium leading-5 text-[#FFFFFF52] rounded-[10px]"
          />
          {formik.errors.password && formik.touched.password && (
            <p className="text-red-500 text-[8px] mt-1 absolute -bottom-3">
              {formik.errors.password}
            </p>
          )}
        </div>

        <label className="container font-inter mt-[26px]">
          I agree to CryptoHunt’s Terms and Privacy Policy
          <input type="checkbox" checked={isChecked} onChange={handleChange} />
          <span className="checkmark"></span>
        </label>

        {loginError && (
          <p className="text-red-500 text-[8px] text-center mt-2">
            {loginError}
          </p>
        )}
        <div className="flex flex-col mt-[26px] gap-[13px]">
          <FormButton
            type="submit"
            children={formik.isSubmitting ? "Logging..." : "Continue"}
            disabled={formik.isSubmitting}
            buttonClasses={undefined}
          />
          <FormButton
            type="submit"
            children={"Terms"}
            buttonClasses="!bg-transparent !text-primary-900 hover:!bg-primary-900 hover:!text-white"
          />
          <FormButton
            type="submit"
            children={"Privacy Policy"}
            buttonClasses="!bg-transparent !text-primary-900 hover:!bg-primary-900 hover:!text-white"
          />
        </div>
      </form>
    </AuthModal>
  );
}

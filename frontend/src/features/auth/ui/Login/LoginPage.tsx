import FormInput from "../../../../shared/FormInputs";
import FormButton from "../../../../shared/FormButton";
import AuthModal from "../../../../shared/AuthModal";
import { useState, useContext } from "react";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { VerifyContext } from "../../../../app/VerifyContext";

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

  const handleSubmit = async (
    values: { email: string; password: string },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    setLoginError("");
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

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: formSchema,
    onSubmit: handleSubmit,
  });

  return (
    <AuthModal modalClassName="max-w-[400px] mx-auto p-7 w-full max-h-fit rounded-[13px]">
      <h1 className="font-poppins text-xl md:text-2xl text-left leading-normal md:leading-[33.33px] font-semibold text-white m-0">
        Admin Login
      </h1>

      <p className="mt-2.5 font-inter font-medium text-sm text-white-600 text-left leading-5">
        Don't have an account?{" "}
        <Link to="/admin/register" className="text-[#259DA8]">
          Register here
        </Link>
      </p>

      <form
        onSubmit={formik.handleSubmit}
        className="flex flex-col font-inter mt-[26px]"
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

        {loginError && (
          <p className="text-red-500 text-sm text-center mt-4">
            {loginError}
          </p>
        )}
        <div className="flex flex-col mt-[26px]">
          <FormButton
            type="submit"
            children={formik.isSubmitting ? "Logging in..." : "Login"}
            disabled={formik.isSubmitting}
            buttonClasses={undefined}
          />
        </div>
      </form>
    </AuthModal>
  );
}

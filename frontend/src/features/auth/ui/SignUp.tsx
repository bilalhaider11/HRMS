import FormButton from "../../../shared/FormButton";
import FormInput from "../../../shared/FormInputs";
import AuthModal from "../../../shared/AuthModal";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/auth";
import { useFormik } from "formik";
import * as Yup from "yup";

const formSchema = Yup.object().shape({
  companyName: Yup.string().required("Company name is required"),
  website: Yup.string().required("Website is required"),
  address: Yup.string().required("Address is required"),
  phone: Yup.string().required("Phone is required"),
  email: Yup.string()
    .email("Invalid Email address")
    .required("Email is required"),
  password: Yup.string()
    .min(2, "Password must be 2 characters at minimum")
    .required("Password is required"),
});

export default function SignUp() {
  const navigate = useNavigate();
  const [signUpError, setSignUpError] = useState("");

  const inputClassName = "border border-solid border-[#FFFFFF21] bg-[#FFFFFF08] py-2.5 px-[13px] font-inter text-xs font-medium leading-5 text-[#FFFFFF52] rounded-[10px]";

  const handleSubmit = async (
    values: {
      companyName: string;
      website: string;
      address: string;
      phone: string;
      email: string;
      password: string;
    },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    setSignUpError("");
    const { ok, data } = await signup(
      values.companyName,
      values.website,
      values.address,
      values.phone,
      values.email,
      values.password
    );
    if (ok && data.success) {
      navigate("/admin/login");
    } else {
      setSignUpError(
        data.message || "Registration failed. Please try again."
      );
    }
    setSubmitting(false);
  };

  const formik = useFormik({
    initialValues: {
      companyName: "",
      website: "",
      address: "",
      phone: "",
      email: "",
      password: "",
    },
    validationSchema: formSchema,
    onSubmit: handleSubmit,
  });

  return (
    <AuthModal modalClassName="max-w-lg mx-auto p-7 w-full max-h-fit">
      <h1 className="font-poppins text-2xl text-left leading-[33.33px] font-semibold text-white m-0">
        Register Admin Account
      </h1>
      <p className="mt-2.5 font-inter font-medium text-sm text-white-600 text-left leading-5">
        Already registered?{" "}
        <Link to="/admin/login" className="text-[#259DA8]">
          Sign in here
        </Link>
      </p>

      <form onSubmit={formik.handleSubmit} className="flex flex-col font-inter mt-[26px]">
        <div className="flex flex-col gap-[13px]">
          <div className="relative">
            <FormInput
              label="" type="text" id="companyName" name="companyName"
              placeholder="Company Name"
              onChange={formik.handleChange} value={formik.values.companyName}
              labelClassName={undefined} inputClassName={inputClassName}
            />
            {formik.errors.companyName && formik.touched.companyName && (
              <p className="text-red-500 text-[8px] mt-1 absolute -bottom-[15px]">
                {formik.errors.companyName}
              </p>
            )}
          </div>
          <div className="relative">
            <FormInput
              label="" type="text" id="website" name="website"
              placeholder="Website"
              onChange={formik.handleChange} value={formik.values.website}
              labelClassName={undefined} inputClassName={inputClassName}
            />
            {formik.errors.website && formik.touched.website && (
              <p className="text-red-500 text-[8px] mt-1 absolute -bottom-[15px]">
                {formik.errors.website}
              </p>
            )}
          </div>
          <div className="relative">
            <FormInput
              label="" type="text" id="address" name="address"
              placeholder="Address"
              onChange={formik.handleChange} value={formik.values.address}
              labelClassName={undefined} inputClassName={inputClassName}
            />
            {formik.errors.address && formik.touched.address && (
              <p className="text-red-500 text-[8px] mt-1 absolute -bottom-[15px]">
                {formik.errors.address}
              </p>
            )}
          </div>
          <div className="relative">
            <FormInput
              label="" type="text" id="phone" name="phone"
              placeholder="Phone"
              onChange={formik.handleChange} value={formik.values.phone}
              labelClassName={undefined} inputClassName={inputClassName}
            />
            {formik.errors.phone && formik.touched.phone && (
              <p className="text-red-500 text-[8px] mt-1 absolute -bottom-[15px]">
                {formik.errors.phone}
              </p>
            )}
          </div>
          <div className="relative">
            <FormInput
              label="" type="email" id="email" name="email"
              placeholder="Email"
              onChange={formik.handleChange} value={formik.values.email}
              labelClassName={undefined} inputClassName={inputClassName}
            />
            {formik.errors.email && formik.touched.email && (
              <p className="text-red-500 text-[8px] mt-1 absolute -bottom-[15px]">
                {formik.errors.email}
              </p>
            )}
          </div>
          <div className="relative">
            <FormInput
              label="" type="password" id="password" name="password"
              placeholder="Password"
              onChange={formik.handleChange} value={formik.values.password}
              labelClassName={undefined} inputClassName={inputClassName}
            />
            {formik.errors.password && formik.touched.password && (
              <p className="text-red-500 text-[8px] mt-1 absolute -bottom-[15px]">
                {formik.errors.password}
              </p>
            )}
          </div>
        </div>

        {signUpError && (
          <p className="text-red-500 text-sm text-center mt-4">
            {signUpError}
          </p>
        )}
        <div className="flex flex-col mt-[26px]">
          <FormButton
            type="submit"
            children={formik.isSubmitting ? "Registering..." : "Register"}
            disabled={formik.isSubmitting}
            buttonClasses={undefined}
          />
        </div>
      </form>
    </AuthModal>
  );
}

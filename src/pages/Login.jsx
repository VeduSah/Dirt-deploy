import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
const Login = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [btnDisable, setBtnDisable] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password!");
      return;
    }

    try {
      setBtnDisable(true);
      const res = await axios.post(
        "https://dirt-off-backend-main.vercel.app/api/auth/login",
        {
          email,
          password,
        }
      );

      if (res.data.success) {
        console.log("API Response:", res.data); // Add this line
        localStorage.setItem("currentUser", true);
        localStorage.setItem("userRole", res.data.staff.role);

        localStorage.setItem("userName", res.data.staff.firstName);
        toast.success("Logged in successfully!");

        // Navigate based on role
        // Navigate based on role
        if (res.data.staff.role === "admin") {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/entrylist", { replace: true });
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setBtnDisable(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      navigate("/", { replace: true });
    } else return;
  }, [currentUser]);
  return (
    <>
      {/*  <Toaster />*/}
      <div
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1516815334695-610d284a5d50?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
        }}
        className="hero min-h-screen bg-base-200"
      >
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="hero-content flex-col md:gap-16 lg:flex-row-reverse">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl font-bold text-white">Login now!</h1>
            <p className="py-6 text-white">
              Welcome to DirtOff - Your trusted laundry management system.
              Access your dashboard to manage orders, customers, and staff
              efficiently.
            </p>
          </div>
          <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
            <form className="card-body">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="email"
                  className="input input-bordered"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  placeholder="password"
                  className="input input-bordered"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="form-control mt-6">
                <button
                  disabled={btnDisable}
                  onClick={login}
                  className="btn btn-primary"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;

import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCookie } from "../store/cookie/cookieSlice";
import Header from "../components/Header";
import Footer from "../components/Footer";

const CookiePolicy = () => {
  const dispatch = useDispatch();
  const { cookie, isLoading, isError, message } = useSelector(
    (state) => state.cookie,
  );
  const { user } = useSelector((state) => state.auth || { user: null });
  const isLoggedIn = !!user;

  useEffect(() => {
    dispatch(getCookie());
  }, [dispatch]);

  return (
    <>
      {!isLoggedIn && <Header />}

      {/* FIX: Added pt-24 for header spacing */}
      <div className={!isLoggedIn ? "pt-24" : ""}>
        {/* Hero Section with Background Image */}
        <div className="relative flex items-center justify-center flex-col h-[200px] bg-hero-img bg-center bg-no-repeat w-full bg-cover">
          {/* Dark overlay for improved text contrast */}
          <div className="absolute inset-0 bg-black bg-opacity-70"></div>
          <h1 className="relative z-10 text-center font-extrabold text-4xl md:text-5xl text-white drop-shadow-2xl">
            {cookie && cookie.title ? cookie.title : "Cookie Policy"}
          </h1>
          <div className="relative z-10 flex gap-2 font-medium pt-4 text-white">
            <Link
              to="/"
              className="no-underline hover:text-theme-color transition-all"
            >
              Home
            </Link>
            <span>/</span>
            <span className="text-theme-color">Cookies Policy</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 py-12 flex flex-col mx-auto">
          {isError && (
            <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md border border-red-300 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Error: {message}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                {cookie && (cookie.text || cookie.content) ? (
                  <article className="prose max-w-full">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: cookie.text || cookie.content,
                      }}
                    />
                  </article>
                ) : (
                  <div className="text-center py-12">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-500 text-lg">
                      No Cookie policy content is available at this time.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {!isLoggedIn && <Footer />}
    </>
  );
};

export default CookiePolicy;

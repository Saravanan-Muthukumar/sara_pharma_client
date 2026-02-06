import React from 'react'
import { Link } from 'react-router-dom'
import SaraPharma1 from '../img/sarapharma1.png'

const PackageIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M12 2 4.5 6v12L12 22l7.5-4V6L12 2Z"
      className="stroke-current"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M12 22V12"
      className="stroke-current"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M19.5 6 12 10.5 4.5 6"
      className="stroke-current"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M12 2v8.5"
      className="stroke-current"
      strokeWidth="1.8"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
)

const Home = () => {
  return (
    <div className="w-full">
      {/* Hero Image */}
      <img
        src={SaraPharma1}
        alt="Sara Pharma"
        className="w-full object-cover"
      />

      {/* Mobile Quick Tiles */}
      <div className="md:hidden px-4 py-16">
        <div className="grid grid-cols-1 gap-8">
          <Link
            to="/package"
            className="
              group
              rounded-2xl
              border
              border-gray-200
              bg-white/70
              p-4
              shadow-sm
              backdrop-blur
              transition
              active:scale-[0.99]
            "
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-2 text-indigo-600">
                <PackageIcon className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-gray-900">
                    Packaging
                  </p>
                  <span className="text-gray-400 transition group-active:translate-x-0.5">
                    ›
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">
                  Take • Verify • Pack
                </p>
              </div>
            </div>
          </Link>
          <Link
            to="/feedback"
            className="
              group
              rounded-2xl
              border
              border-gray-200
              bg-white/70
              p-4
              shadow-sm
              backdrop-blur
              transition
              active:scale-[0.99]
            "
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-2 text-indigo-600">
                <PackageIcon className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-gray-900">
                    Feedback
                  </p>
                  <span className="text-gray-400 transition group-active:translate-x-0.5">
                    ›
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">
                  Call • Remarks • Ok
                </p>
              </div>
            </div>
          </Link>

          {/* Future tile placeholder (keep or remove) */}
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white/40 p-4">
            <p className="text-sm font-medium text-gray-400">More soon</p>
            <p className="mt-1 text-xs text-gray-400">Reports • Stock • etc.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

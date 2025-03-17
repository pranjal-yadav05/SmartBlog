"use client";

const SmartBlogLogo = () => {
  return (
    <div className="inline-block w-full">
      <svg viewBox="0 0 400 80" className="w-full h-auto">
        <text x="10" y="55" fontSize="50" fontFamily="Rock Salt" stroke="black" strokeWidth="2" fill="none">
          SmartBlog
        </text>
      </svg>

      <style jsx>{`
        svg {
          display: block;
        }
        text {
          stroke-dasharray: 900;
          stroke-dashoffset: 900;
          animation: write 1.5s ease-in-out infinite alternate;
        }
        @keyframes write {
          from {
            stroke-dashoffset: 900;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SmartBlogLogo;
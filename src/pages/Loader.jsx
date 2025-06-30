const Loader = () => (
  <div className="flex justify-center items-center py-8">
    <div className="relative">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-300"></div>
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-purple-600 absolute top-0 left-0"></div>
    </div>
  </div>
);
export default Loader;

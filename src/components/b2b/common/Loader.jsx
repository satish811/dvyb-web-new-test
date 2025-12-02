/**
 * Loader Component
 * Simple spinning loader with customizable size and color
 */
const Loader = ({ size = 12 }) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className={`border-t-4 border-b-4 border-gray-200 rounded-full animate-spin`}
        style={{
          width: `${size}rem`,
          height: `${size}rem`,
          borderTopColor: "#800000",
          borderBottomColor: "#800000",
        }}
      ></div>
    </div>
  );
};

export default Loader;

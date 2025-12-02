import DisplayCard from "./DisplayCard";

export default function ProductGrid({ products, columns = 4, scroll = false }) {
  if (scroll) {
    return (
      <div className="overflow-x-auto sm:overflow-x-auto  scrollbar-none hide-scrollbar scroll-smooth md:overflow-hidden">
        <div className="flex gap-4 px-2 sm:px-4 md:px-10 min-w-max">
          {products.map((p) => (
            <div key={p.id} className="w-72 sm:w-80 md:w-95 flex-shrink-0">
              <DisplayCard product={p} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Regular grid layout
  const colMap = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
  };

  return (
    <div
      className={`cursor-pointer grid grid-cols-2 ${colMap[columns]} gap-2 md:gap-4 px-2 sm:px-3 md:px-3 lg:px-10 mt-4`}
    >
      {products.map((p) => (
        <DisplayCard key={p.id} product={p} />
      ))}
    </div>
  );
}

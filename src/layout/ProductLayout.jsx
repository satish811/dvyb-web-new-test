import Sidebar from "../components/b2c/sidebar/Sidebar";


export default function ProductLayout({ children, products }) {
  return (
    <>

      <div className=" h-full flex container mx-auto px-4 mt-40 overflow-x-hidden scrollbar-hide">
        
        {/* Sidebar */}
        <aside className="lg:w-1/4">
          <Sidebar products={products} />
        </aside>
        
        {/* Ads + Product grid area */}
        <section className="lg:w-3/4  h-[185vh] flex flex-col">
          {/* Children - scrollable area taking remaining height */}
          <div className="flex min-h-0 overflow-y-auto no-scrollbar hide-scrollbar">
            {children}
          </div>
        </section>

      </div>

    </>
  );
}

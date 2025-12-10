import React from 'react';

const WeddingCard = ({ image, title, onShopClick }) => {
  return (
    <article className="group relative overflow-hidden bg-white cursor-pointer">
      <div className="relative w-full h-[400px] sm:h-[450px] md:h-[400px] lg:h-[400px] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-center">
          <h3 className="text-white font-medium text-sm md:text-md lg:text-xl uppercase tracking-wider mb-2 md:mb-2">
            {title}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShopClick();
            }}
            className="text-white uppercase text-sm md:text-base tracking-widest hover:underline hover:underline-offset-4 transition-all duration-300"
          >
            Shop Now
          </button>
        </div>
      </div>
    </article>
  );
};

const WeddingSection = ({ products, col = 3 }) => {
  const handleShopClick = (title) => {
    console.log(`Navigate to ${title}`);
  };

  // Dynamic grid columns based on col prop
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }[col] || 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <section className="mx-auto px-4 md:px-8 lg:px-9">
      {/* Cards Grid */}
      <div className={`grid ${gridColsClass} gap-2 md:gap-3`}>
        {products?.map((item) => (
          <WeddingCard
            key={item.id}
            image={item?.images?.[0]}
            title={item.title}
            onShopClick={() => handleShopClick(item.title)}
          />
        ))}
      </div>
    </section>
  );
};

export default WeddingSection;
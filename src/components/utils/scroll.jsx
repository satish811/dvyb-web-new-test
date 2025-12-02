// utils/scroll.js
export const scrollLeft = (id) => {
  const element = document.getElementById(id);
  console.log("Scroll element:", element); // Debug log
  if (element) {
    element.scrollBy({
      left: -300,
      behavior: "smooth",
    });
  } else {
    console.warn(`Element with id '${id}' not found`);
  }
};

export const scrollRight = (id) => {
  const element = document.getElementById(id);
  console.log("Scroll element:", element); // Debug log
  if (element) {
    element.scrollBy({
      left: 300,
      behavior: "smooth",
    });
  } else {
    console.warn(`Element with id '${id}' not found`);
  }
};

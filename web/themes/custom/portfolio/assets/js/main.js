//grab everything we need
const btn = document.querySelector("button.mobile-menu-button");
const menu = document.querySelector(".mobile-menu");
const close = document.querySelector("button.mobile-close-button");

//add event listeners

btn.addEventListener("click", () =>{
  menu.classList.toggle("hidden");
});
close.addEventListener("click", () =>{
  menu.classList.toggle("hidden");
});

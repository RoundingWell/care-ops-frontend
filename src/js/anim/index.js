import anime from 'animejs';

function animSidebar(targets) {
  return anime({
    targets,
    translateX: [{ value: 20, duration: 0 }, { value: 0, duration: 200 }],
    opacity: [{ value: 0, duration: 0 }, { value: 1, duration: 300 }],
    easing: 'easeInOutQuad',
  });
}

export {
  animSidebar,
};

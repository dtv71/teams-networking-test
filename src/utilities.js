export function $(selector) {
  return document.querySelector(selector);
}

export function $$(selector) {
  return document.querySelectorAll(selector);
}

export function debounce(fn, ms) {
  let timer;
  console.info("debounce", ms);
  return function (e) {
    console.warn("inside", timer, this, arguments);
    const context = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function (c) {
      console.warn("debounce timeout...", context);
      //fn.call(context, e);
      //sau
      fn.apply(context, args);
      //sau
      // fn.apply(context, [e]);
    }, ms);
  };
}

/**
 *
 * @param {String|Element} el
 */
export function mask(el) {
  if (typeof el === "string") {
    el = $(el);
  }
  el && el.classList.add("loading-mask");
}

/**
 *
 * @param {String|Element} el
 */
export function unmask(el) {
  if (typeof el === "string") {
    el = $(el);
  }
  el && el.classList.remove("loading-mask");
}

export function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export function filterElements(elements, search) {
  search = search.toLowerCase();
  return elements.filter(element => {
    return Object.entries(element).some(([key, value]) => {
      if (key !== "id") {
        return value.toLowerCase().includes(search);
      }
    });
  });
}

(async () => {
  console.info("1. start sleeping...");
  await sleep(2000);
  console.warn("2. ready to do %o", "next job");
})();

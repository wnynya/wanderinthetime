document.querySelector('#button-search').addEventListener('click', () => {
  let value = document.querySelector('#input-search').value;
  if (!value) {
    value = Math.random();
  }
  window.location.href = `/${value}`;
});

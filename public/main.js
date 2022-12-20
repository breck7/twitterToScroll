const input = document.getElementById('namebox');
const button = document.getElementById('namebutton');

button.addEventListener('click', () => {
  const username = input.value;
  // download scroll zip from server
  window.location.assign(`/getscroll?username=${username}`);
});
const { counter, payload } = __DATA;

const form = document.getElementById('unlock-form');
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const key = aesjs.utils.hex.toBytes(form.elements.key.value);
  const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(counter));
  const decrypted = aesCtr.decrypt(aesjs.utils.hex.toBytes(payload));
  const decryptedString = aesjs.utils.utf8.fromBytes(decrypted);

  try {
    const { login, password, notes } = JSON.parse(decryptedString);
    form.innerHTML = `
      <p><b>Login:</b> ${login}</p>
      <p>
        <b>Password:</b>
        <span id="password">********</span>
        <button type="button" onclick='document.getElementById("password").innerText = ${JSON.stringify(password)}; event.target.remove();'>
          Reveal
        </button>
      </p>
      <p><b>Notes:</b><br>${notes}</p>
    `;
  } catch (err) {
    console.error(err);
    alert('Invalid key');
  }
});
const form = document.getElementById('password-form');
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = {
    login: form.elements.login.value,
    password: form.elements.password.value,
    notes: form.elements.notes.value,
  };

  const key = crypto.getRandomValues(new Uint8Array(32));
  const counter = crypto.getRandomValues(new Uint8Array(1))[0];

  const textBytes = aesjs.utils.utf8.toBytes(JSON.stringify(payload));

  const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(counter));
  const encryptedBytes = aesCtr.encrypt(textBytes);

  const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);

  const response = await fetch('/create-password', {
    method: 'POST',
    body: JSON.stringify({
      expiresIn: form.elements.expiresIn.value,
      payload: encryptedHex,
      counter,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const body = await response.text();
  const link = `${window.location.protocol}//${window.location.host}/password/${body}`;
  form.innerHTML = `
    <p>Link: <a href="${link}">${link}</a></p>
    <p style="word-wrap: break-word; width: 100%;">Key: ${aesjs.utils.hex.fromBytes(key)}</p>
  `;
});

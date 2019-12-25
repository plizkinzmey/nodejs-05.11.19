const $login = document.querySelector('.auth-login');
const $password = document.querySelector('.auth-password');
const $submit = document.querySelector('.auth-submit');

$submit.addEventListener('click', onAuthSubmit);

async function onAuthSubmit() {
  const payload = {
    login: $login.value,
    password: $password.value,
  };

  try {
    const response = await fetch('/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const user = await response.json();

    localStorage.setItem('authToken', user.token);

    window.location = '/tasks';
  } catch (err) {
    alert('Ошибка при авторизации');
  }
};
const $login = document.querySelector('.registration-login');
const $email = document.querySelector('.registration-email');
const $password = document.querySelector('.registration-password');
const $passwordConfirm = document.querySelector('.registration-password-confirm');
const $submit = document.querySelector('.registration-submit');

$submit.addEventListener('click', onRegisterSubmit);

async function onRegisterSubmit() {
  const payload = {
    login: $login.value,
    email: $email.value,
    password: $password.value,
    repassword: $passwordConfirm.value,
  };

  try {
    let response = await fetch('/registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    response = await response.json();

    if (!response.success) {
      throw Error;
    }
    
    window.location = '/auth';
  } catch (err) {
    alert('Ошибка при регистрации');
  }
};
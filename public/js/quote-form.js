// Quote form: records when the form was opened, preselects ?product=,
// and submits with fetch so errors show inline without losing what was typed.
(function () {
  'use strict';
  var form = document.getElementById('quote-form');
  if (!form) return;

  var status = form.querySelector('.form__status');
  var button = form.querySelector('button[type="submit"]');
  form.hidden = false;
  form.elements.t.value = String(Date.now());

  var wanted = new URLSearchParams(location.search).get('product');
  if (wanted && form.elements.product.querySelector('option[value="' + CSS.escape(wanted) + '"]')) {
    form.elements.product.value = wanted;
  }

  function setStatus(text, state) {
    status.textContent = text;
    status.dataset.state = state || '';
  }

  function clearErrors() {
    form.querySelectorAll('.field__err').forEach(function (el) { el.remove(); });
    form.querySelectorAll('[aria-invalid]').forEach(function (el) {
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
    });
  }

  function showFieldError(name, message) {
    var input = form.elements[name];
    if (!input || !input.closest) return;
    var p = document.createElement('p');
    p.className = 'field__err';
    p.id = 'err-' + name;
    p.textContent = message;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', p.id);
    input.closest('.field').appendChild(p);
  }

  function validate() {
    var errors = {};
    var v = function (n) { return form.elements[n].value.trim(); };
    if (!v('name')) errors.name = 'Please enter your name.';
    if (!/^[+\d][\d\s()-]{6,}$/.test(v('phone'))) errors.phone = 'Please enter a phone or WhatsApp number.';
    if (v('email') && !form.elements.email.checkValidity()) errors.email = 'This email address looks incomplete.';
    if (v('message').length < 5) errors.message = 'Please tell us a little about what you need.';
    return errors;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();

    var errors = validate();
    var names = Object.keys(errors);
    if (names.length) {
      names.forEach(function (n) { showFieldError(n, errors[n]); });
      form.elements[names[0]].focus();
      setStatus('Please check the highlighted fields.', 'error');
      return;
    }
    if (form.dataset.preview) {
      setStatus('Preview only: the form is not connected yet, so nothing was sent.', 'error');
      return;
    }
    if (!form.querySelector('[name="cf-turnstile-response"]') || !form.querySelector('[name="cf-turnstile-response"]').value) {
      setStatus('Please wait for the spam check to finish, then send again.', 'error');
      return;
    }

    button.disabled = true;
    setStatus('Sending…');

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    })
      .then(function (res) {
        return res.json().catch(function () { return { ok: false }; });
      })
      .then(function (data) {
        if (data.ok) {
          location.href = data.redirect || form.action.replace(/quote\.php$/, 'contact/thanks/');
          return;
        }
        if (data.errors) {
          Object.keys(data.errors).forEach(function (n) { showFieldError(n, data.errors[n]); });
        }
        setStatus(data.message || 'Sorry, something went wrong. Please WhatsApp or call us instead.', 'error');
        if (window.turnstile) window.turnstile.reset();
        button.disabled = false;
      })
      .catch(function () {
        setStatus('Could not send. Check your connection, or WhatsApp us instead.', 'error');
        button.disabled = false;
      });
  });
})();

/**
 * Submits the newsletter form without leaving the page.
 *
 * Without this the form is still complete and still works: it is a real
 * <form method="POST" action="/thank-you"> that Netlify accepts, so a reader
 * with no JavaScript subscribes and lands on the thank-you page. The only thing
 * this file changes is that a reader halfway down the templates library does not
 * get navigated away from it for giving us an address.
 *
 * Netlify Forms accepts a urlencoded POST to any path on the site as long as the
 * `form-name` field names a form it detected at deploy time, which is why that
 * field is added here rather than sitting in the markup: it is only needed for
 * the fetch path, and a visible duplicate in the HTML is one more thing to keep
 * in step with the form's name.
 */

const setStatus = (form, message, state) => {
  const status = form.querySelector('[data-newsletter-status]');
  if (!status) return;
  status.textContent = message;
  status.dataset.state = state;
};

const submit = async (form) => {
  const button = form.querySelector('[type="submit"]');
  const status = form.querySelector('[data-newsletter-status]');
  const body = new URLSearchParams();
  body.set('form-name', form.getAttribute('name'));
  for (const [field, value] of new FormData(form)) {
    if (typeof value === 'string') body.set(field, value);
  }

  if (button) {
    button.disabled = true;
    button.textContent = button.dataset.sendingLabel || button.textContent;
  }

  try {
    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    if (!response.ok) throw new Error(`Netlify Forms replied ${response.status}`);
    setStatus(form, status?.dataset.success || '', 'success');
    form.querySelector('input[type="email"]')?.setAttribute('value', '');
    form.reset();
  } catch {
    setStatus(form, status?.dataset.error || '', 'error');
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = button.dataset.submitLabel || button.textContent;
    }
  }
};

for (const form of document.querySelectorAll('form[data-newsletter]')) {
  form.addEventListener('submit', (event) => {
    // Let the browser show its own validation bubble rather than posting an
    // empty address and reporting a failure we could have predicted.
    if (!form.checkValidity()) return;
    event.preventDefault();
    submit(form);
  });
}

const hashParameters = new URLSearchParams(window.location.hash.slice(1));
const hasIdentityCallback = hashParameters.has('invite_token') || hashParameters.has('recovery_token');

if (hasIdentityCallback) {
    const modal = document.querySelector('#identity-modal');
    const title = document.querySelector('#identity-modal-title');
    const description = document.querySelector('#identity-modal-description');
    const form = document.querySelector('#identity-password-form');
    const passwordInput = document.querySelector('#identity-password');
    const confirmationInput = document.querySelector('#identity-password-confirmation');
    const errorMessage = document.querySelector('#identity-modal-error');
    const submitButton = document.querySelector('#identity-submit-button');
    const successPanel = document.querySelector('#identity-modal-success');

    modal.hidden = false;
    document.body.classList.add('identity-modal-open');

    let callbackResult;
    let identity;

    const showError = message => {
        title.textContent = 'This secure link could not be completed';
        description.textContent = message;
        form.hidden = true;
    };

    try {
        identity = await import('https://esm.sh/@netlify/identity@1.2.0');
        callbackResult = await identity.handleAuthCallback();

        if (callbackResult?.type === 'invite') {
            title.textContent = 'Create your account password';
            description.textContent = 'Choose a password to accept your invitation and activate your account.';
        } else if (callbackResult?.type === 'recovery') {
            title.textContent = 'Reset your password';
            description.textContent = 'Choose a new password for your account.';
        } else {
            throw new Error('Unsupported Identity callback.');
        }

        form.hidden = false;
        passwordInput.focus();
    } catch (error) {
        const identityUnavailable = identity && error instanceof identity.MissingIdentityError;
        showError(identityUnavailable
            ? 'Netlify Identity is not available for this site.'
            : 'The link is invalid or has expired. Request a new invitation or password-reset email and try again.');
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();
        errorMessage.textContent = '';

        if (passwordInput.value.length < 8) {
            errorMessage.textContent = 'Use at least 8 characters for your password.';
            passwordInput.focus();
            return;
        }

        if (passwordInput.value !== confirmationInput.value) {
            errorMessage.textContent = 'The passwords do not match.';
            confirmationInput.focus();
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Saving…';

        try {
            if (callbackResult.type === 'invite') {
                await identity.acceptInvite(callbackResult.token, passwordInput.value);
                title.textContent = 'Your account is ready';
                description.textContent = 'Your invitation was accepted and your password was saved.';
            } else {
                await identity.updateUser({ password: passwordInput.value });
                title.textContent = 'Your password was updated';
                description.textContent = 'You can now sign in with your new password.';
            }

            form.reset();
            form.hidden = true;
            successPanel.hidden = false;
        } catch (error) {
            if (error instanceof identity.MissingIdentityError) {
                errorMessage.textContent = 'Netlify Identity is not available for this site.';
            } else if (error instanceof identity.AuthError && [401, 404, 422].includes(error.status)) {
                errorMessage.textContent = 'The link is invalid or expired, or the password does not meet the account requirements.';
            } else {
                errorMessage.textContent = 'The password could not be saved. Please try again.';
            }
        } finally {
            passwordInput.value = '';
            confirmationInput.value = '';
            submitButton.disabled = false;
            submitButton.textContent = 'Save password';
        }
    });
}

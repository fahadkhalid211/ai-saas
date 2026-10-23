/**
 * Two-factor sign-in is switched off for new set-ups while it is being fixed: the Security tab does not offer it and the server
 * refuses to start it. People who already turned it on keep their protection (the sign-in still asks for their code) and can
 * switch it off from the Security tab. Set this to true to offer it again.
 */
export const TWO_FACTOR_SETUP_AVAILABLE = false;

export const TWO_FACTOR_UNAVAILABLE_MESSAGE = 'Two-factor sign-in is not available right now.';

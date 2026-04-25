import { assertTrustedMutationRequest, RequestSecurityError } from '../requestSecurity';

export class AdminRequestError extends RequestSecurityError {}

export function assertTrustedAdminPostRequest(request: Request) {
    try {
        assertTrustedMutationRequest(request);
    } catch (error) {
        if (error instanceof RequestSecurityError) {
            throw new AdminRequestError(error.message, error.status);
        }

        throw error;
    }
}
